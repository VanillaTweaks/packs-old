import getItemDataPath from 'lib/datapacks/getItemDataPath';
import pack from 'lib/datapacks/pack';
import { ItemModifier, MCFunction } from 'sandstone';

const itemData = getItemDataPath(pack);

export const copyStorageToBook = ItemModifier(pack`copy_storage_to_book`, {
	// TODO: Remove `as 'copy_nbt'`.
	function: 'minecraft:copy_nbt' as 'copy_nbt',
	source: {
		type: 'minecraft:storage',
		source: pack`main`
	},
	ops: [{
		source: 'book',
		target: itemData``,
		op: 'replace'
	}]
});

export const copyBookToStorage = MCFunction(pack`copy_book_to_storage`, () => {
	// data.modify.storage(pack`main`, itemData``).set.from
});