import { Advancement, MCFunction, NBT, execute, summon, scoreboard, advancement, particle } from 'sandstone';
import pack from 'lib/pack';
import checkLoadStatus from 'lib/datapacks/lanternLoad/checkLoadStatus';
import temp from 'lib/datapacks/temp';
import vt from 'lib/vt';
import armorStandBook from '../armorStandBook';
import useBook from '../useBook';
import every from 'lib/datapacks/every';
import matchesLecternID from './matchesLecternID';
import lecternID from './lecternID';

const $lastLecternID = lecternID('$last_value');

const useLecternAdvancement = Advancement(pack`use_lectern`, {
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
		function: MCFunction(pack`_use_lectern`, () => {
			advancement.revoke('@s').only(useLecternAdvancement);

			// When a player uses a lectern, we know they are no longer using a book in their hand.
			scoreboard.players.reset('@s', useBook);

			/** A score of the number of steps which have occurred in the lectern raycast. */
			const $steps = temp('$steps');
			scoreboard.players.set($steps, 0);

			execute
				.anchored('eyes')
				.run(MCFunction(pack`_find_lectern`, function () {
					execute
						.if.block('~ ~ ~', 'minecraft:lectern')
						.run(pack`_mark_lectern`, () => {
							// Mark the lectern so it can be associated with the player who clicked it via a score.

							summon('minecraft:marker', '~ ~ ~', { Tags: [pack.lectern, pack.new] });

							execute
								.store.result.score(`@e[tag=${pack.new},distance=..0.01,limit=1]`, lecternID)
								.run.scoreboard.players.add($lastLecternID, 1);
							scoreboard.players.operation('@s', lecternID, '=', $lastLecternID);
						});

					execute
						.unless.block('~ ~ ~', 'minecraft:lectern')
						.positioned('^ ^ ^0.01')
						// TODO: Remove `as any`.
						.if($steps.matches('..500' as any))
						.run(this);
				}));
		})
	}
});

every('1s', pack, () => {
	execute
		.as(`@e[type=minecraft:marker,tag=${pack.lectern}]`)
		.at('@s')
		.run(pack`_kill_invalid_lectern_marker`, () => {
			execute
				.unless.block('~ ~ ~', 'minecraft:lectern')
				.run.kill('@s');

			execute
				.if.block('~ ~ ~', 'minecraft:lectern')
				.run(pack`_kill_lectern_marker_without_player`, () => {
					scoreboard.players.operation('$lecternID', temp, '=', '@s', lecternID);
					execute
						.unless.entity(`@a[predicate=${matchesLecternID}]`)
						.run.kill('@s');
				});
		});
});