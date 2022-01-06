import { Advancement, MCFunction, NBT, execute, summon, scoreboard } from 'sandstone';
import pack from 'lib/datapacks/pack';
import objective from 'lib/datapacks/objective';
import checkLoadStatus from 'lib/datapacks/lanternLoad/checkLoadStatus';
import temp from 'lib/datapacks/temp';
import internalBasePath from 'lib/datapacks/internalBasePath';

const lectern = pack.child({ directory: 'lectern' });
const lectern_ = internalBasePath(pack);

export const lecternID = objective(pack, 'lectern_id');
const $lastID = lecternID('$last_id');

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

			// TODO: Replace all `$steps.target, $steps.objective` with `$steps`.
			scoreboard.players.set($steps.target, $steps.objective, 0);

			MCFunction(lectern_`find`, function () {
				execute
					// TODO: Use string coordinates.
					.if.block(['~', '~', '~'], 'minecraft:lectern')
					.run(lectern_`mark`, () => {
						// Mark the lectern so that it can be associated with the player who clicked it via a score.

						// TODO: Use string coordinates.
						summon('minecraft:marker', ['~', '~', '~'], {
							Tags: [lecternTag, newTag]
						});

						execute
							.store.result.score(lecternID('@s'))
							// TODO: Replace `$lastID.target, $lastID.objective` with `$lastID`.
							.run.scoreboard.players.add($lastID.target, $lastID.objective, 1);
						scoreboard.players.operation(
							// TODO: Replace first two arguments with an equivalent `lecternID` call.
							`@e[tag=${newTag},distance=..0.01,limit=1]`,
							lecternID.name,
							'=',
							// TODO: Replace last two arguments with `$lastID`.
							$lastID.target,
							$lastID.objective
						);
					});

				execute
					.anchored('eyes')
					// TODO: Use string coordinates.
					.positioned(['^', '^', '^0.01'])
					// TODO: Remove `as any`.
					.if($steps.matches('..500' as any))
					.run(this);
			})();
		})
	}
});