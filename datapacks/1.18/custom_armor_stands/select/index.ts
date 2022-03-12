import pack from 'lib/pack';
import { execute, MCFunction } from 'sandstone';
import armorStandID from './armorStandID';

const $lastArmorStandID = armorStandID('$last_value');

/** Selects the armor stand `@s` by assigning it an `armorStandID` score (or using the one it has already) and setting that ID on the book in storage. */
const select = MCFunction(pack`_select`, () => {
	execute
		// TODO: Remove `as any`.
		.unless.score('@s', armorStandID, 'matches', '1..' as any)
		.store.result.score('@s', armorStandID)
		.run.scoreboard.players.add($lastArmorStandID, 1);

	execute
		.store.result.storage(pack`main`, `book.data.${pack}.armorStandID`, 'int')
		.run.scoreboard.players.get('@s', armorStandID);
});

export default select;