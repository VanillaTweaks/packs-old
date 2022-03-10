import temp from 'lib/datapacks/temp';
import pack from 'lib/pack';
import { data, execute, ItemModifier, MCFunction, scoreboard, tag } from 'sandstone';
import { bookInMainhand, bookInOffhand } from './armorStandBook/predicates';
import { lecternID } from './lectern';

/**
 * A score with 0 if the armor stand book is in neither hand, 1 if it's in the mainhand, or 2 if it's in the offhand.
 *
 * ⚠️ The value of this score is arbitrary if the book is in a lectern.
 */
const $bookInHand = temp('$bookInHand');

export const copyBookToStorage = MCFunction(pack`_copy_book_to_storage`, () => {
	execute
		// TODO: Remove `as any`.
		.if.score('@s', lecternID, 'matches', '1..' as any)
		.run(pack`_check_lectern_for_book`, () => {
			const $lecternID = temp('$lecternID');
			scoreboard.players.operation($lecternID, '=', '@s', lecternID);

			execute
				.as(`@e[type=minecraft:marker,tag=${pack.lectern}]`)
				// TODO: Replace `'$lecternID', temp` with `$lecternID`.
				.if.score('$lecternID', temp, '=', '@s', lecternID)
				.run.tag('@s').add(pack.current_lectern);

			const currentLectern = `@e[type=minecraft:marker,tag=${pack.current_lectern},limit=1]`;

			execute
				.at(currentLectern)
				.run.data.modify.storage(pack`main`, 'book').set.from.block('~ ~ ~', 'Book.tag');

			execute
				.unless.entity(currentLectern)
				.run.tellraw('@s', {
					text: 'The lectern you used could not be found.',
					color: 'red'
				});

			tag(currentLectern).remove(pack.current_lectern);
		});

	execute
		// TODO: Remove `as any`.
		.unless.score('@s', lecternID, 'matches', '1..' as any)
		.run(pack`_check_hands_for_book`, () => {
			scoreboard.players.set($bookInHand, 0);

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

export const copyStorageToBook = ItemModifier(pack`copy_storage_to_book`, {
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