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

const fallbackTick = vt.child({ directory: 'fallback_tick' });
const fallbackTick_ = internalBasePath(fallbackTick);

const $vtLoadStatus = loadStatusOf(vt);

const fallbackTickTag = Tag('functions', vt_`fallback_tick`, [
	addTempObjective,
	// We schedule the `fixMaxCommandChainLengthTag` instead of running it directly so it can't run multiple times each tick.
	scheduleFixMaxCommandChainLength,
	MCFunction(fallbackTick_`revoke_from_all`, () => {
		// Revoke the `tickAdvancement` from all players in case anyone kept it due to the `maxCommandChainLength` being too low.
		advancement.revoke('@a').only(tickAdvancement);
	})
], { runEveryTick: true });

/** An advancement granted to all players and immediately revoked every tick, unless the `function-permission-level` is too low, in which case it will not be revoked, or unless the `maxCommandChainLength` is 1, in which case it will be revoked after 1 tick. */
export const tickAdvancement = Advancement(fallbackTick`tick`, {
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
						// Ensure VT is not uninstalled, since otherwise the `fallbackTickTag` would add objectives even after the `uninstall` function was run.
						range: -1
					// TODO: Remove `as any`.
					} as any
				}]
			}
		}
	},
	rewards: {
		function: MCFunction(fallbackTick_`tick_advancement_reward`, () => {
			// Schedule `fallbackTickTag` first in case their `maxCommandChainLength` is too low to run it second, since it has `scheduleFixMaxCommandChainLength` in it.
			// The reason we must schedule it instead of calling it immediately is because the `function` command counts toward the `maxCommandChainLength`, so nothing inside the function tag would run if the `maxCommandChainLength` is 1.
			schedule.function(fallbackTickTag, '1t');

			// Revoke immediately so that no player can ever have this advancement for a full tick as long as the `function-permission-level` and `maxCommandChainLength` are both at default.
			advancement.revoke('@s').only(tickAdvancement);
		})
	}
});
revokeOnPlayerLoadOrJoin(fallbackTick, tickAdvancement);

onUninstall(fallbackTick, () => {
	schedule.clear(fallbackTickTag);
});

/**
 * Runs something as close as possible to every tick when `#minecraft:load` isn't working, using advancement reward functions and `#minecraft:tick`.
 *
 * ⚠️ Only for emergency use cases. Use `every('1t', ...)` instead if possible.
 */
const onFallbackTick = (
	...args: [
		/** The `BasePath` to put the `fallback_tick` function under. */
		basePath: VTBasePathInstance,
		callback: () => void
	] | [
		/** The function or function tag to add to the `fallbackTickTag`. */
		functionOrFunctionTag: MCFunctionInstance | TagInstance<'functions'>
	]
) => {
	let functionOrFunctionTag: MCFunctionInstance | TagInstance<'functions'>;

	if (args.length === 1) {
		[functionOrFunctionTag] = args;
	} else {
		const [basePath, callback] = args;
		const basePath_ = internalBasePath(basePath);

		functionOrFunctionTag = MCFunction(basePath_`fallback_tick`, callback, {
			onConflict: 'append'
		});
	}

	// TODO: Use `!fallbackTickTag.has(functionOrFunctionTag)` instead.
	if (!fallbackTickTag.values.some(value => value.toString() === functionOrFunctionTag.toString())) {
		// TODO: Remove `as any`.
		fallbackTickTag.add(functionOrFunctionTag as any);
	}
};

export default onFallbackTick;