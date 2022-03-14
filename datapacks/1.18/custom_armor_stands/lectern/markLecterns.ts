import { Advancement, MCFunction, execute, summon, scoreboard, advancement, kill } from 'sandstone';
import pack from 'lib/pack';
import checkLoadStatus from 'lib/datapacks/lanternLoad/checkLoadStatus';
import temp from 'lib/datapacks/temp';
import useBook from '../useBook';
import every from 'lib/datapacks/every';
import matchesLecternID from './matchesLecternID';
import lecternID from './lecternID';
import { lecternWithArmorStandBook, lecternWithArmorStandBookSNBT } from '.';

const $lastLecternID = lecternID('$last_value');

/** A score of whether there is a lectern with an armor stand book at `~ ~ ~`. */
const $lectern = temp('$lectern');

const useLecternAdvancement = Advancement(pack`use_lectern`, {
	criteria: {
		requirement: {
			trigger: 'minecraft:item_used_on_block',
			conditions: {
				player: [checkLoadStatus()],
				location: {
					block: {
						blocks: ['minecraft:lectern'],
						nbt: lecternWithArmorStandBookSNBT
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
				.positioned('^ ^ ^')
				.run(MCFunction(pack`_find_lectern`, function () {
					scoreboard.players.set($lectern, 0);

					execute
						.if.block('~ ~ ~', lecternWithArmorStandBook)
						.run(pack`_mark_lectern`, () => {
							// Mark the lectern so it can be associated with the player who clicked it via a score.

							summon('minecraft:marker', '~ ~ ~', { Tags: [pack.lectern, pack.new] });

							execute
								.store.result.score(`@e[tag=${pack.new},distance=..0.01,limit=1]`, lecternID)
								.run.scoreboard.players.add($lastLecternID, 1);
							scoreboard.players.operation('@s', lecternID, '=', $lastLecternID);

							scoreboard.players.set($lectern, 1);
						});

					execute
						.if($lectern.matches(0))
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
			scoreboard.players.set($lectern, 1);

			execute
				.unless.block('~ ~ ~', lecternWithArmorStandBook)
				.run(pack`_kill_lectern_marker_without_lectern`, () => {
					kill('@s');

					scoreboard.players.set($lectern, 0);
				});

			execute
				.if($lectern.matches(1))
				.run(pack`_kill_lectern_marker_without_player`, () => {
					scoreboard.players.operation('$lecternID', temp, '=', '@s', lecternID);
					execute
						.unless.entity(`@a[predicate=${matchesLecternID},limit=1]`)
						.run.kill('@s');
				});
		});
});