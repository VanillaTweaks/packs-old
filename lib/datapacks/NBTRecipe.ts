import type { RecipeJSON } from 'sandstone';
import type { FunctionRecipeJSON } from 'lib/datapacks/FunctionRecipe';
import FunctionRecipe from 'lib/datapacks/FunctionRecipe';
import type { BaseLocationInstance } from 'lib/BaseLocation';
import type { UnionOmit } from 'lib/types';
import type { ItemInstance } from 'lib/datapacks/Item';
import giveItem from 'lib/datapacks/Item/giveItem';

export type NBTRecipeJSON = UnionOmit<Extract<RecipeJSON, { type: FunctionRecipeJSON['type'] }>, 'result'> & {
	result: {
		item: ItemInstance,
		count?: number
	}
};

/** A crafting recipe that outputs a knowledge book which gives the player an item with custom NBT when taken from the crafting output. */
const NBTRecipe = (
	/** The `BaseLocation` under which to create the necessary directories and resources. */
	baseLocation: BaseLocationInstance,
	recipeJSON: NBTRecipeJSON
) => {
	FunctionRecipe(baseLocation, recipeJSON.result.item.nameWithoutBase, {
		...recipeJSON,
		result: () => {
			const count = recipeJSON.result.count ?? 1;
			for (let i = 0; i < count; i++) {
				giveItem(recipeJSON.result.item);
			}
		}
	});
};

export default NBTRecipe;