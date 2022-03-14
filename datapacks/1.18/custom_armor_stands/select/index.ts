import temp from 'lib/datapacks/temp';
import pack from 'lib/pack';
import { join, minify } from 'minecraft-text-components';
import { effect, execute, MCFunction, tellraw } from 'sandstone';
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

	effect.give('@s', 'minecraft:glowing', 4, 0, true);

	tellraw(`@a[tag=${pack.triggerer},limit=1]`, minify([
		{ text: 'Selected the armor stand at ', color: 'gold' },
		{ text: '(', color: 'yellow' },
		join(
			[0, 1, 2].map(posIndex => {
				const $pos = temp(`$pos.${posIndex}`);

				execute
					.store.result.score($pos)
					.run.data.get.entity('@s', `Pos[${posIndex}]`);

				// TODO: Replace `{ name: $pos.target, objective: $pos.objective.toString() }` with `$pos`.
				return { score: { name: $pos.target, objective: $pos.objective.toString() }, color: 'yellow' };
			}),
			{ text: ', ', color: 'yellow' }
		),
		{ text: ')', color: 'yellow' },
		{ text: '.', color: 'gold' }
	]));
});

export default select;