import temp from 'lib/datapacks/temp';
import pack from 'lib/pack';
import { data, execute, ItemModifier, MCFunction, scoreboard, tag } from 'sandstone';
import { bookInMainhand, bookInOffhand } from './armorStandBook/predicates';
import { lecternID } from './lectern';

/** A score with 0 if the armor stand book is in neither hand, 1 if it's in the mainhand, or 2 if it's in the offhand. */
const $bookInHand = temp('$bookInHand');

/** A selector to the marker with the `pack.current_lectern` tag. */
const currentLectern = `@e[type=minecraft:marker,tag=${pack.current_lectern},limit=1]`;

/**
 * Copies the armor stand book's NBT from the lectern or the player (`@s`) to storage.
 *
 * ⚠️ `copyStorageToBook` must always be called within the same tick after calling this, unless the book is not found.
 */
export const copyBookToStorage = MCFunction(pack`_copy_book_to_storage`, () => {
	scoreboard.players.set($bookInHand, 0);

	execute
		// TODO: Remove `as any`.
		.if.score('@s', lecternID, 'matches', '1..' as any)
		.run(pack`_copy_lectern_book_to_storage`, () => {
			const $lecternID = temp('$lecternID');
			scoreboard.players.operation($lecternID, '=', '@s', lecternID);

			execute
				.as(`@e[type=minecraft:marker,tag=${pack.lectern}]`)
				// TODO: Replace `'$lecternID', temp` with `$lecternID`.
				.if.score('$lecternID', temp, '=', '@s', lecternID)
				.run.tag('@s').add(pack.current_lectern);

			execute
				.at(currentLectern)
				.run.data.modify.storage(pack`main`, 'book').set.from.block('~ ~ ~', 'Book.tag');

			execute
				.unless.entity(currentLectern)
				.run.tellraw('@s', {
					text: 'The lectern you used could not be found.',
					color: 'red'
				});

			// The `pack.current_lectern` tag is not removed here because it is used to target the same lectern again in `copyStorageToBook`.
			// This is why `copyStorageToBook` must always be called within the same tick after calling this, to ensure that tag doesn't stay beyond this tick.
		});

	execute
		// TODO: Remove `as any`.
		.unless.score('@s', lecternID, 'matches', '1..' as any)
		.run(pack`_copy_hand_book_to_storage`, () => {
			execute
				// TODO: Remove `as any`.
				.if.predicate(bookInMainhand as any)
				.run(pack`_copy_mainhand_book_to_storage`, () => {
					data.modify.storage(pack`main`, 'book').set.from.entity('@s', 'SelectedItem.tag');

					scoreboard.players.set($bookInHand, 1);
				});

			execute
				.if($bookInHand.matches(0))
				// TODO: Remove `as any`.
				.if.predicate(bookInOffhand as any)
				.run(pack`_copy_offhand_book_to_storage`, () => {
					data.modify.storage(pack`main`, 'book').set.from.entity('@s', 'Inventory[{Slot:-106b}].tag');

					scoreboard.players.set($bookInHand, 2);
				});

			execute
				.if($bookInHand.matches(0))
				.run.tellraw('@s', {
					text: 'The book you used could not be found.',
					color: 'red'
				});
		});
});

const copyStorageToBookItemModifier = ItemModifier(pack`copy_storage_to_book`, {
	// TODO: Remove `as 'copy_nbt'`.
	function: 'minecraft:copy_nbt' as 'copy_nbt',
	source: {
		type: 'minecraft:storage',
		source: pack`main`
	},
	ops: [{
		source: 'book',
		target: '{}',
		op: 'replace'
	}]
});

/**
 * Copies the armor stand book's NBT from storage back to the lectern or the player (`@s`).
 *
 * Does nothing if no book was found in the last call to `copyBookToStorage`.
 *
 * ⚠️ `copyBookToStorage` must always be called within the same tick before calling this.
 */
export const copyStorageToBook = MCFunction(pack`_copy_storage_to_book`, () => {
	execute
		.if($bookInHand.matches(0))
		// Note: If no lectern marker was found by `copyBookToStorage`, then `currentLectern` won't target anything.
		.as(currentLectern)
		.at('@s')
		.run(pack`_copy_storage_to_lectern_book`, () => {
			data.modify.block('~ ~ ~', 'Book.tag').set.from.storage(pack`main`, 'book');

			tag('@s').remove(pack.current_lectern);
		});

	execute
		.if($bookInHand.matches(1))
		.run.item.modify.entity('@s', 'weapon.mainhand', copyStorageToBookItemModifier);

	execute
		.if($bookInHand.matches(2))
		.run.item.modify.entity('@s', 'weapon.offhand', copyStorageToBookItemModifier);
});