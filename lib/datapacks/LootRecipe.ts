import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import { advancement, Advancement, execute, kill, LootTable, MCFunction, NBT, recipe, Recipe, scoreboard } from 'sandstone';
import type { RecipeJSON, RootNBT } from 'sandstone';
import vt from 'lib/datapacks/vt';
import internalBasePath from 'lib/datapacks/internalBasePath';
import objective from 'lib/datapacks/objective';
import every from 'lib/datapacks/every';
import giveLootTable from 'lib/datapacks/giveLootTable';
import temp from 'lib/datapacks/temp';

const lootRecipes = vt.child({ directory: 'loot_recipes' });
const lootRecipes_ = internalBasePath(lootRecipes);

const craftedKnowledgeBook = objective(lootRecipes, 'crafted_knowledge_book', 'minecraft.crafted:minecraft.knowledge_book');
/** `@s`'s `craftedKnowledgeBook` score. */
const $craftedKnowledgeBook = craftedKnowledgeBook('@s');

every('1t', lootRecipes, () => {
	// Reset everyone's `craftedKnowledgeBook` score in case they crafted a knowledge book by external means.
	// No need to do this for spectators since spectators can't craft.
	// TODO: Remove `.name`.
	scoreboard.players.reset('@a[gamemode=!spectator]', craftedKnowledgeBook.name);
});

export type LootRecipeJSON = RecipeJSON & {
	type: Extract<RecipeJSON, { result: { item: string } }>['type'],
	result: {
		nbt: RootNBT
	}
};

/** A crafting recipe that outputs a knowledge book which gives the player a specified loot table when taken out of the crafting output. */
const LootRecipe = (
	/** The `BasePath` under which to create a `recipes` directory for the recipes, loot tables, advancements, and functions. */
	basePath: VTBasePathInstance,
	/** The non-namespaced name of the recipe. */
	name: string,
	recipeJSON: LootRecipeJSON
) => {
	const recipes = basePath.child({ directory: 'recipes' });
	const recipes_ = internalBasePath(recipes);

	const lootTable = LootTable(recipes.getResourceName(name), {
		type: 'minecraft:command',
		pools: [{
			rolls: 1,
			entries: [{
				type: 'minecraft:item',
				name: recipeJSON.result.item,
				functions: [{
					// TODO: Remove type assertion.
					function: 'minecraft:set_nbt' as 'set_nbt',
					tag: NBT.stringify(recipeJSON.result.nbt)
				}]
			}]
		}]
	});

	/** The crafting recipe that outputs a knowledge book. */
	// TODO: Replace all `.getResourceName` with template tagging.
	const lootRecipe = Recipe(basePath.getResourceName(name), {
		...recipeJSON,
		result: {
			item: 'minecraft:knowledge_book',
			...recipeJSON.result.count !== undefined && {
				count: recipeJSON.result.count
			}
		}
	});

	const recipeUnlockedAdvancement = Advancement(recipes.getResourceName(name), {
		parent: Advancement(recipes`root`, {
			criteria: {
				impossible: {
					trigger: 'minecraft:impossible'
				}
			}
		}),
		criteria: {
			recipe_unlocked: {
				trigger: 'minecraft:recipe_unlocked',
				conditions: {
					// TODO: Remove `.toString()`.
					recipe: lootRecipe.toString()
				}
			}
		},
		rewards: {
			function: MCFunction(recipes_.getResourceName(`${name}/unlock`), () => {
				// This runs `as` and `at` any player who unlocks the recipe (e.g. due to crafting the recipe or using `/recipe give`).

				advancement.revoke('@s').only(recipeUnlockedAdvancement);
				// TODO: Remove `.toString()`.
				recipe.take('@s', lootRecipe.toString());

				execute
					// Check if they actually crafted a knowledge book and aren't unlocking the recipe by other means.
					// TODO: Replace all `greaterThan(0)` with `matches('1..')`.
					.if($craftedKnowledgeBook.greaterThan(0))
					.run(recipes_.getResourceName(`${name}/craft`), () => {
						MCFunction(lootRecipes_`craft`, () => {
							// This runs `as` and `at` any player who successfully crafts a loot recipe.

							// Try to delete the knowledge book.
							// Clear it from their inventory.
							const $clearedKnowledgeBook = temp('$clearedKnowledgeBook');
							execute
								.store.success.score($clearedKnowledgeBook)
								// I wish we could simply only clear the knowledge books without NBT on them, or at least without the `Recipes` tag on them.
								.run.clear('@s', 'minecraft:knowledge_book', 1);
							// Or if it wasn't directly in their inventory, kill it in case they tried to drop it.
							execute
								.if($clearedKnowledgeBook.matches(0))
								// TODO: Don't wrap these arguments in `MCFunction`.
								.run.schedule.function(MCFunction(lootRecipes_`kill_knowledge_book`, () => {
									kill(`@e[type=item,limit=1,nbt=${
										NBT.stringify({
											Item: { id: 'minecraft:knowledge_book' }
										})
									},nbt=!${
										NBT.stringify({
											// Ensure the knowledge book being killed doesn't have any NBT on it, meaning it likely came from crafting output and can't possibly be a meaningful item.
											Item: { tag: {} }
										})
									}]`);
								}), '1t', 'append');
							// Or if they bundled it, just let them have it.

							// Reset the player's `craftedKnowledgeBook` score so it can still be detected as not 1 later in this tick.
							// TODO: Replace `$craftedKnowledgeBook.target, $craftedKnowledgeBook.objective` with `$craftedKnowledgeBook`.
							scoreboard.players.reset($craftedKnowledgeBook.target, $craftedKnowledgeBook.objective);
						})();

						giveLootTable(lootTable);
					});
			})
		}
	});
};

export default LootRecipe;