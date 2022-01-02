import type { MCFunctionInstance, TagInstance } from 'sandstone';
import { advancement, Advancement, MCFunction, schedule, Tag } from 'sandstone';
import vt, { vt_ } from 'lib/datapacks/vt';
import revokeOnPlayerLoadOrJoin from 'lib/datapacks/revokeOnPlayerLoadOrJoin';
import internalBasePath from 'lib/datapacks/internalBasePath';
import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import { addTempObjective } from 'lib/datapacks/temp';
import { scheduleFixMaxCommandChainLength } from 'lib/datapacks/faultChecking/fixMaxCommandChainLength';
import onUninstall from 'lib/datapacks/pseudoEvents/onUninstall';
import loadStatusOf from 'lib/datapacks/lanternLoad/loadStatusOf';

const advancementTick = vt.child({ directory: 'advancement_tick' });
const advancementTick_ = internalBasePath(advancementTick);

const $vtLoadStatus = loadStatusOf(vt);

const advancementTickTag = Tag('functions', vt_`advancement_tick`, [
	addTempObjective,
	// We schedule the `fixMaxCommandChainLengthTag` instead of running it directly so it can't run multiple times each tick.
	scheduleFixMaxCommandChainLength,
	MCFunction(advancementTick_`revoke_from_all`, () => {
		// Revoke the `tickAdvancement` from all players in case anyone kept it due to the `maxCommandChainLength` being too low.
		advancement.revoke('@a').only(tickAdvancement);
	})
]);

/** An advancement granted to all players every tick, unless the `function-permission-level` is too low, in which case the advancement will be granted and then never revoked. */
export const tickAdvancement = Advancement(advancementTick`tick`, {
	criteria: {
		tick: {
			trigger: 'minecraft:tick',
			conditions: {
				player: [{
					condition: 'minecraft:inverted',
					term: {
						condition: 'minecraft:value_check',
						value: {
							type: 'minecraft:score',
							target: {
								type: 'minecraft:fixed',
								name: $vtLoadStatus.target.toString()
							},
							score: $vtLoadStatus.objective
						},
						// Ensure VT was not uninstalled, since otherwise the reward function would add objectives even after the `uninstall` function was run.
						range: -1
					// TODO: Remove `as any`.
					} as any
				}]
			}
		}
	},
	rewards: {
		function: MCFunction(vt_`advancement_tick`, () => {
			// Schedule `advancementTickTag` first in case their `maxCommandChainLength` is too low to run it second, since it has `scheduleFixMaxCommandChainLength` in it.
			schedule.function(advancementTickTag, '1t');

			// Revoke immediately so that no player can ever have this advancement for a full tick as long as the `function-permission-level` and `maxCommandChainLength` are both at default.
			advancement.revoke('@s').only(tickAdvancement);
		})
	}
});
revokeOnPlayerLoadOrJoin(advancementTick, tickAdvancement);

onUninstall(advancementTick, () => {
	schedule.clear(advancementTickTag);
});

/** Runs something one tick after every tick that a player is online, using an advancement reward function rather than `#minecraft:load`. */
const onAdvancementTick = (
	...args: [
		/** The `BasePath` to put the `advancement_tick` function under. */
		basePath: VTBasePathInstance,
		callback: () => void
	] | [
		/** The function or function tag to add to the `advancementTickTag`. */
		functionOrFunctionTag: MCFunctionInstance | TagInstance<'functions'>
	]
) => {
	let functionOrFunctionTag: MCFunctionInstance | TagInstance<'functions'>;

	if (args.length === 1) {
		[functionOrFunctionTag] = args;
	} else {
		const [basePath, callback] = args;
		const basePath_ = internalBasePath(basePath);

		functionOrFunctionTag = MCFunction(basePath_`advancement_tick`, callback, {
			onConflict: 'append'
		});
	}

	// TODO: Use `!advancementTickTag.has(functionOrFunctionTag)` instead.
	if (!advancementTickTag.values.some(value => value.toString() === functionOrFunctionTag.toString())) {
		// TODO: Remove `as any`.
		advancementTickTag.add(functionOrFunctionTag as any);
	}
};

export default onAdvancementTick;