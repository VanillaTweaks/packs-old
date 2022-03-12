import temp from 'lib/datapacks/temp';
import pack from 'lib/pack';
import { data, execute, MCFunction, scoreboard, tag } from 'sandstone';
import { $bookInHand, currentLectern } from '.';
import { bookInMainhand, bookInOffhand } from '../armorStandBook/predicates';
import lecternID from '../lectern/lecternID';
import matchesLecternID from '../lectern/matchesLecternID';

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
			scoreboard.players.operation('$lecternID', temp, '=', '@s', lecternID);
			tag(`@e[type=minecraft:marker,tag=${pack.lectern},predicate=${matchesLecternID}]`)
				.add(pack.current_lectern);

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