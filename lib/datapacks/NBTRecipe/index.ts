import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import { advancement, Advancement, clear, execute, LootTable, MCFunction, NBT, recipe, Recipe, say, scoreboard, stopsound } from 'sandstone';
import type { RecipeJSON, RootNBT } from 'sandstone';
import vt from 'lib/datapacks/vt';
import internalBasePath from 'lib/datapacks/internalBasePath';
import objective from 'lib/datapacks/objective';
import every from 'lib/datapacks/every';
import temp from 'lib/datapacks/vt/temp';

const nbtRecipes = vt.child({ directory: 'nbt_recipes' });

const craftedKnowledgeBook = objective(nbtRecipes, 'crafted_knowledge_book', 'minecraft.crafted:minecraft.knowledge_book');
/** `@s`'s `craftedKnowledgeBook` score. */
const $craftedKnowledgeBook = craftedKnowledgeBook('@s');

/** An `MCFunction` called as any player who crafts an NBT recipe. */
const craftNBTRecipe = MCFunction(nbtRecipes`craft`, () => {
	clear('@s', 'minecraft:knowledge_book', 1);

	stopsound('@s', '*', 'minecraft:entity.item.pickup');

	// Reset the player's `craftedKnowledgeBook` score so that the score being detected as not 1 is still accurate later in this tick.
	// TODO: Replace `$craftedKnowledgeBook.target, $craftedKnowledgeBook.objective` with `$craftedKnowledgeBook`.
	scoreboard.players.reset($craftedKnowledgeBook.target, $craftedKnowledgeBook.objective);
});

export type NBTRecipeJSON = RecipeJSON & {
	type: Extract<RecipeJSON, { result: { item: string } }>['type'],
	result: {
		nbt: RootNBT
	}
};

/** A crafting recipe that outputs a knowledge book which becomes a specified item with NBT when taken out of the crafting output. */
const NBTRecipe = (
	/** The `BasePath` under which to create a `recipes` directory for the recipes, loot tables, advancements, and functions. */
	basePath: VTBasePathInstance,
	/** The non-namespaced name of the recipe. */
	name: string,
	recipeJSON: NBTRecipeJSON
) => {
	const recipes = basePath.child({ directory: 'recipes' });
	const recipes_ = internalBasePath(recipes);

	every('1t', recipes, () => {
		// Reset everyone's `craftedKnowledgeBook` score in case they crafted a knowledge book by a means independent from Vanilla Tweaks.
		// No need to do this for spectators since spectators can't craft.
		// TODO: Remove `.name`.
		scoreboard.players.reset('@a[gamemode=!spectator]', craftedKnowledgeBook.name);
	});

	/** The crafting recipe that outputs a knowledge book. */
	// TODO: Replace all `.getResourceName` with template tagging.
	const nbtRecipe = Recipe(recipes.getResourceName(name), {
		...recipeJSON,
		result: {
			item: 'minecraft:knowledge_book',
			...recipeJSON.result.count !== undefined && {
				count: recipeJSON.result.count
			}
		}
	});

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
					recipe: nbtRecipe.toString()
				}
			}
		},
		rewards: {
			function: MCFunction(recipes_.getResourceName(`${name}/unlock`), () => {
				// This runs as any player who unlocks the NBT recipe (e.g. due to crafting the recipe or using `/recipe give`).

				advancement.revoke('@s').only(recipeUnlockedAdvancement);
				// TODO: Remove `.toString()`.
				recipe.take('@s', nbtRecipe.toString());

				execute
					// Check if they actually crafted a knowledge book and aren't unlocking the recipe by other means.
					// TODO: Replace all `greaterThan(0)` with `matches('1..')`.
					.if($craftedKnowledgeBook.greaterThan(0))
					.run(recipes_.getResourceName(`${name}/craft`), () => {
						craftNBTRecipe();

						const $lootGiveResult = temp('$lootGiveResult');
						execute
							.store.result.score($lootGiveResult)
							.run.loot.give('@s').loot(lootTable);
						// This fallback is only necessary because of https://bugs.mojang.com/browse/MC-154422.
						execute
							.if($lootGiveResult.matches(0))
							.anchored('eyes')
							// TODO: Replace `['^', '^', '^']` with `'^ ^ ^'`.
							.run.loot.spawn(['^', '^', '^']).loot(lootTable);
					});
			})
		}
	});
};

export default NBTRecipe;