import { Advancement, MCFunction, NBT, execute, summon } from 'sandstone';
import pack from 'lib/datapacks/pack';
import objective from 'lib/datapacks/objective';
import checkLoadStatus from 'lib/datapacks/lanternLoad/checkLoadStatus';

const lectern = pack.child({ directory: 'lectern' });

const markerID = objective(pack, 'marker_id');
const $lastID = markerID('$last_id');

// TODO: Replace all `lecternTag` with `` pack`.lectern` ``.
const lecternTag = 'custom_armor_stands.lectern';
// TODO: Replace all `newTag` with `` pack`.new` ``.
const newTag = 'custom_armor_stands.new';

const detectLectern = MCFunction(lectern`detect`, () => {
	execute
		// TODO: Use string coordinates.
		.if.block(['~', '~', '~'], 'minecraft:lectern')
		.run(lectern`mark`, () => {
			// Mark the lectern so that it can be associated with the player who clicked it.

			// TODO: Use string coordinates.
			summon('minecraft:marker', ['~', '~', '~'], {
				Tags: [lecternTag, newTag]
			});
			execute
				.as(`@e[tag=${newTag},distance=..0.01,limit=1]`)
				.run(lectern`initialize_marker`, () => {
					// Use a score to associate the marker with the player.

					execute
						.store.result.score(markerID('@s'))
						// TODO: Replace `$lastID.target, $lastID.objective` with `$lastID`.
						.run.scoreboard.players.add($lastID.target, $lastID.objective, 1);
				});
		});
	execute
		// TODO: Use string coordinates.
		.positioned(['^', '^', '^0.01'])
		.if.entity('@s[distance=..5]')
		.run(detectLectern);
});

Advancement(lectern`detect`, {
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
		function: detectLectern
	}
});