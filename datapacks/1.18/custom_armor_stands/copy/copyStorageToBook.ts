import pack from 'lib/pack';
import { data, execute, ItemModifier, MCFunction, tag } from 'sandstone';
import { $bookLocation, BookLocation, currentLectern } from '.';

const copyStorageToBookItemModifier = ItemModifier(pack`copy_storage_to_book`, {
	// TODO: Remove `as 'copy_nbt'`.
	function: 'minecraft:copy_nbt' as 'copy_nbt',
	source: {
		type: 'minecraft:storage',
		source: pack`main`
	},
	ops: ['data', 'pages', 'display'].map(path => ({
		source: `book.${path}`,
		target: path,
		op: 'replace'
	}))
});

/**
 * Copies the armor stand book's NBT from storage back to the lectern or the player (`@s`).
 *
 * Does nothing if no book was found in the last call to `copyBookToStorage`.
 *
 * ⚠️ `copyBookToStorage` must always be called within the same tick before calling this.
 */
const copyStorageToBook = MCFunction(pack`_copy_storage_to_book`, () => {
	execute
		.as(currentLectern)
		.at('@s')
		.run(pack`_copy_storage_to_lectern_book`, () => {
			data.modify.block('~ ~ ~', 'Book.tag').set.from.storage(pack`main`, 'book');

			tag('@s').remove(pack.current_lectern);
		});

	execute
		.if($bookLocation.matches(BookLocation.MAINHAND))
		.run.item.modify.entity('@s', 'weapon.mainhand', copyStorageToBookItemModifier);

	execute
		.if($bookLocation.matches(BookLocation.OFFHAND))
		.run.item.modify.entity('@s', 'weapon.offhand', copyStorageToBookItemModifier);
});

export default copyStorageToBook;