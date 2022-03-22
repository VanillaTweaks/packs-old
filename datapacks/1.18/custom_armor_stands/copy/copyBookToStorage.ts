import temp from 'lib/datapacks/temp';
import pack from 'lib/pack';
import { data, execute, MCFunction, NBT, Predicate, scoreboard } from 'sandstone';
import { $bookLocation, BookLocation, currentLectern } from '.';
import { lecternWithArmorStandBook } from '../lectern';
import lecternID from '../lectern/lecternID';
import matchesLecternID from '../lectern/matchesLecternID';
import vt from 'lib/vt';
import type { ItemCriterion } from 'sandstone/arguments/resources/criteria';
import armorStandBook from '../pages';
import useBook from '../useBook';

const armorStandBookCriterion: ItemCriterion = {
	items: ['minecraft:written_book'],
	nbt: NBT.stringify({
		data: {
			[vt.NAMESPACE]: {
				item: armorStandBook.name
			}
		}
	})
};

/**
 * Copies the armor stand book's NBT from the lectern or the player (`@s`) to storage.
 *
 * ⚠️ `copyStorageToBook` must always be called within the same tick after calling this, unless the book is not found.
 */
const copyBookToStorage = MCFunction(pack`_copy_book_to_storage`, () => {
	scoreboard.players.set($bookLocation, BookLocation.NOT_FOUND);

	// If a player last used a book in their hand, we know they didn't use a lectern.
	scoreboard.players.reset(`@a[scores={${useBook}=1..}]`, lecternID);

	execute
		// TODO: Remove `as any`.
		.if.score('@s', lecternID, 'matches', '1..' as any)
		.run(pack`_find_lectern_book_to_copy_to_storage`, () => {
			scoreboard.players.operation('$lecternID', temp, '=', '@s', lecternID);
			execute
				.as(`@e[type=minecraft:marker,tag=${pack.lectern},predicate=${matchesLecternID},limit=1]`)
				.at('@s')
				// Check that the lectern marker is at a lectern with an armor stand book, in case it isn't but hasn't been killed yet.
				.if.block('~ ~ ~', lecternWithArmorStandBook)
				.run.tag('@s').add(pack.current_lectern);

			execute
				.at(currentLectern)
				.run(pack`_copy_lectern_book_to_storage`, () => {
					data.modify.storage(pack`main`, 'book').set.from.block('~ ~ ~', 'Book.tag');

					scoreboard.players.set($bookLocation, BookLocation.LECTERN);
				});

			execute
				.if($bookLocation.matches(BookLocation.NOT_FOUND))
				.run.tellraw('@s', {
					text: 'The lectern you used could not be found.',
					color: 'red'
				});

			// The `pack.current_lectern` tag is not removed here because it is used to target the same lectern again in `copyStorageToBook`.
			// This is why `copyStorageToBook` must be called within the same tick after calling this, to ensure that tag doesn't stay beyond this tick.
		});

	execute
		// TODO: Remove `as any`.
		.unless.score('@s', lecternID, 'matches', '1..' as any)
		.run(pack`_copy_hand_book_to_storage`, () => {
			execute
				// TODO: Possibly move `Predicate`'s arguments into `.predicate`'s arguments directly.
				.if.predicate(Predicate(pack`armor_stand_book/in_mainhand`, {
					condition: 'minecraft:entity_properties',
					entity: 'this',
					predicate: {
						equipment: {
							mainhand: armorStandBookCriterion
						}
					}
				// TODO: Remove `as any`.
				}) as any)
				.run(pack`_copy_mainhand_book_to_storage`, () => {
					data.modify.storage(pack`main`, 'book').set.from.entity('@s', 'SelectedItem.tag');

					scoreboard.players.set($bookLocation, BookLocation.MAINHAND);
				});

			execute
				.if($bookLocation.matches(BookLocation.NOT_FOUND))
				// TODO: Possibly move `Predicate`'s arguments into `.predicate`'s arguments directly.
				.if.predicate(Predicate(pack`armor_stand_book/in_offhand`, {
					condition: 'minecraft:entity_properties',
					entity: 'this',
					predicate: {
						equipment: {
							offhand: armorStandBookCriterion
						}
					}
				// TODO: Remove `as any`.
				}) as any)
				.run(pack`_copy_offhand_book_to_storage`, () => {
					data.modify.storage(pack`main`, 'book').set.from.entity('@s', 'Inventory[{Slot:-106b}].tag');

					scoreboard.players.set($bookLocation, BookLocation.OFFHAND);
				});

			execute
				.if($bookLocation.matches(BookLocation.NOT_FOUND))
				.run.tellraw('@s', {
					text: 'The book you used could not be found.',
					color: 'red'
				});
		});
});

export default copyBookToStorage;