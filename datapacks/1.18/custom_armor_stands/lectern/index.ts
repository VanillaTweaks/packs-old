import { Advancement, MCFunction, NBT, execute, summon, scoreboard } from 'sandstone';
import pack from 'lib/pack';
import objective from 'lib/datapacks/objective';
import checkLoadStatus from 'lib/datapacks/lanternLoad/checkLoadStatus';
import temp from 'lib/datapacks/temp';
import vt from 'lib/vt';
import armorStandBook from '../armorStandBook';

const lectern = pack.getChild('lectern');

export const lecternID = objective(pack, 'lectern_id');
const $lastValue = lecternID('$last_value');

Advancement(lectern`use`, {
	criteria: {
		requirement: {
			trigger: 'minecraft:item_used_on_block',
			conditions: {
				player: [checkLoadStatus()],
				location: {
					block: {
						nbt: NBT.stringify({
							Book: {
								tag: {
									data: {
										[vt.NAMESPACE]: {
											item: armorStandBook.name
										}
									}
								}
							}
						})
					}
				}
			}
		}
	},
	rewards: {
		function: MCFunction(lectern`_use`, () => {
			/** A score of the number of steps which have occurred in the lectern raycast. */
			const $steps = temp('$steps');

			scoreboard.players.set($steps, 0);

			MCFunction(lectern`_find`, function () {
				execute
					.if.block('~ ~ ~', 'minecraft:lectern')
					.run(lectern`_mark`, () => {
						// Mark the lectern so it can be associated with the player who clicked it via a score.

						summon('minecraft:marker', '~ ~ ~', {
							Tags: [pack.lectern, pack.new]
						});

						execute
							.store.result.score(`@e[tag=${pack.new},distance=..0.01,limit=1]`, lecternID)
							.run.scoreboard.players.add($lastValue, 1);
						scoreboard.players.operation('@s', lecternID, '=', $lastValue);
					});

				execute
					.anchored('eyes')
					.positioned('^ ^ ^0.01')
					// TODO: Remove `as any`.
					.if($steps.matches('..500' as any))
					.run(this);
			})();
		})
	}
});