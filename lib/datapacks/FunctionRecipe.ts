import type { BaseLocationInstance } from 'lib/datapacks/BaseLocation';
import { advancement, Advancement, execute, kill, MCFunction, NBT, recipe, Recipe, scoreboard } from 'sandstone';
import type { RecipeJSON } from 'sandstone';
import vt from 'lib/datapacks/vt';
import objective from 'lib/datapacks/objective';
import every from 'lib/datapacks/every';
import temp from 'lib/datapacks/temp';
import type { UnionOmit } from 'lib/types';
import checkLoadStatus from 'lib/datapacks/lanternLoad/checkLoadStatus';

const vtFunctionRecipes = vt.getChild('function_recipes');

const craftedKnowledgeBook = objective(vtFunctionRecipes, 'crafted_knowledge_book', 'minecraft.crafted:minecraft.knowledge_book');
/** `@s`'s `craftedKnowledgeBook` score. */
const $craftedKnowledgeBook = craftedKnowledgeBook('@s');

every('1t', vtFunctionRecipes, () => {
	// Reset everyone's `craftedKnowledgeBook` score in case they crafted a knowledge book by external means.
	// No need to do this for spectators since spectators can't craft.
	scoreboard.players.reset('@a[gamemode=!spectator]', craftedKnowledgeBook);
});

export type FunctionRecipeJSON = UnionOmit<Extract<RecipeJSON, { result: { item: string } }>, 'result'> & {
	/** What to run when the recipe is crafted. */
	result: () => void
};

/** A crafting recipe that outputs a knowledge book which runs a specified callback `as` and `at` the player when taken from the crafting output. */
const FunctionRecipe = (
	/** The `BaseLocation` under which to create the necessary directories and resources. */
	baseLocation: BaseLocationInstance,
	/** The non-namespaced name of the recipe. */
	name: string,
	recipeJSON: FunctionRecipeJSON
) => {
	/** The crafting recipe that outputs a knowledge book. */
	const functionRecipe = Recipe(baseLocation`${name}`, {
		...recipeJSON,
		result: {
			item: 'minecraft:knowledge_book'
		}
	});

	const recipes = baseLocation.getChild('recipes');
	const functionRecipes = baseLocation.getChild('function_recipes');

	const recipeUnlockedAdvancement = Advancement(recipes`${name}`, {
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
					player: [checkLoadStatus()],
					// TODO: Remove `.name`.
					recipe: functionRecipe.name
				}
			}
		},
		rewards: {
			function: MCFunction(functionRecipes`${name}/_unlock`, () => {
				// This runs `as` and `at` any player who unlocks the recipe (e.g. due to crafting the recipe or using `/recipe give`).

				advancement.revoke('@s').only(recipeUnlockedAdvancement);
				// TODO: Remove `.name`.
				recipe.take('@s', functionRecipe.name);

				execute
					// Check if they actually crafted a knowledge book and aren't unlocking the recipe by other means.
					// TODO: Remove `as any`.
					.if($craftedKnowledgeBook.matches('1..' as any))
					.run(functionRecipes`${name}/_craft`, () => {
						MCFunction(vtFunctionRecipes`_craft`, () => {
							// This runs `as` and `at` any player who successfully crafts one of any `FunctionRecipe`.

							// Try to delete the knowledge book.
							// Clear it from their inventory.
							const $clearedKnowledgeBook = temp('$cleared_knowledge_book');
							execute
								.store.success.score($clearedKnowledgeBook)
								// I wish we could simply only clear the knowledge books without NBT on them, or at least without the `Recipes` tag on them.
								.run.clear('@s', 'minecraft:knowledge_book', 1);
							// Or if it wasn't directly in their inventory, kill it in case they tried to drop it.
							execute
								.if($clearedKnowledgeBook.matches(0))
								// TODO: Don't wrap these arguments in `MCFunction`.
								.run.schedule.function(MCFunction(vtFunctionRecipes`_kill_knowledge_book`, () => {
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
							scoreboard.players.reset($craftedKnowledgeBook);
						})();

						recipeJSON.result();
					});
			})
		}
	});
};

export default FunctionRecipe;