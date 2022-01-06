import { Advancement, MCFunction, NBT, execute, summon, scoreboard } from 'sandstone';
import pack from 'lib/datapacks/pack';
import objective from 'lib/datapacks/objective';
import checkLoadStatus from 'lib/datapacks/lanternLoad/checkLoadStatus';
import temp from 'lib/datapacks/temp';
import internalBasePath from 'lib/datapacks/internalBasePath';

const lectern = pack.child({ directory: 'lectern' });
const lectern_ = internalBasePath(pack);

export const lecternID = objective(pack, 'lectern_id');
const $lastValue = lecternID('$last_value');

// TODO: Replace all `lecternTag` with `` pack`.lectern` ``.
const lecternTag = 'custom_armor_stands.lectern';
// TODO: Replace all `newTag` with `` pack`.new` ``.
const newTag = 'custom_armor_stands.new';

Advancement(lectern`use`, {
	criteria: {
		requirement: {
			trigger: 'minecraft:item_used_on_block',
			conditions: {
				player: [checkLoadStatus()],
				location: {
					block: {
						nbt: NBT.stringify({
							data: {
								[pack.namespace]: {
									item: 'armor_stand_book'
								}
							}
						})
					}
				}
			}
		}
	},
	rewards: {
		function: MCFunction(lectern_`use`, () => {
			/** A score of the number of steps which have occurred in the lectern raycast. */
			const $steps = temp('$steps');

			scoreboard.players.set($steps, 0);

			MCFunction(lectern_`find`, function () {
				execute
					.if.block('~ ~ ~', 'minecraft:lectern')
					.run(lectern_`mark`, () => {
						// Mark the lectern so that it can be associated with the player who clicked it via a score.

						summon('minecraft:marker', '~ ~ ~', {
							Tags: [lecternTag, newTag]
						});

						execute
							.store.result.score(`@e[tag=${newTag},distance=..0.01,limit=1]`, lecternID)
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