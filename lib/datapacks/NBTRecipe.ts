import { LootTable, NBT } from 'sandstone';
import type { RecipeJSON, RootNBT } from 'sandstone';
import type { FunctionRecipeJSON } from 'lib/datapacks/FunctionRecipe';
import FunctionRecipe from 'lib/datapacks/FunctionRecipe';
import type { ResourceLocationInstance } from 'lib/datapacks/ResourceLocation';
import giveLootTable from 'lib/datapacks/giveLootTable';

export type NBTRecipeJSON = Extract<RecipeJSON, { type: FunctionRecipeJSON['type'] }> & {
	result: {
		nbt: RootNBT
	}
};

/** A crafting recipe that outputs a knowledge book which gives the player an item with custom NBT when taken from the crafting output. */
const NBTRecipe = (
	/** The `ResourceLocation` under which to create the necessary directories and resources. */
	resourceLocation: ResourceLocationInstance,
	/** The non-namespaced name of the recipe. */
	name: string,
	recipeJSON: NBTRecipeJSON
) => {
	const items = resourceLocation('items');

	const itemLootTable = LootTable(items`${name}`, {
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

	FunctionRecipe(resourceLocation, name, {
		...recipeJSON,
		result: () => {
			const count = recipeJSON.result.count ?? 1;
			for (let i = 0; i < count; i++) {
				giveLootTable(itemLootTable);
			}
		}
	});
};

export default NBTRecipe;