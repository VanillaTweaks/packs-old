import type { MCFunctionInstance, TagInstance } from 'sandstone';
import { advancement, Advancement, MCFunction, schedule, Tag } from 'sandstone';
import vt, { vt_ } from 'lib/datapacks/vt';
import revokeOnPlayerLoadOrJoin from 'lib/datapacks/revokeOnPlayerLoadOrJoin';
import internalBasePath from 'lib/datapacks/internalBasePath';
import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import { addTempObjective } from 'lib/datapacks/temp';
import { scheduleFixMaxCommandChainLength } from 'lib/datapacks/faultChecking/fixMaxCommandChainLength';

const advancementTick = vt.child({ directory: 'advancement_tick' });

const advancementTickTag = Tag('functions', vt_`advancement_tick`, [
	addTempObjective,
	// We schedule the `fixMaxCommandChainLengthTag` instead of running it directly so it can't run multiple times each tick.
	scheduleFixMaxCommandChainLength
]);

/** An advancement granted to all players every tick, unless the `function-permission-level` is too low, in which case the advancement will be granted and then never revoked. */
export const tickAdvancement = Advancement(advancementTick`tick`, {
	criteria: {
		tick: { trigger: 'minecraft:tick' }
	},
	rewards: {
		function: MCFunction(vt_`advancement_tick`, () => {
			// Schedule `advancementTickTag` first in case their `maxCommandChainLength` is too low to run it second, since it has `scheduleFixMaxCommandChainLength` in it.
			schedule.function(advancementTickTag, '1t');

			// Revoke the advancement so it can be granted again the next tick.
			// If the `maxCommandChainLength` is too low for this to run, it will eventually run `onPlayerLoadOrJoin`, assuming the warning messages are obeyed.
			advancement.revoke('@s').only(tickAdvancement);
		})
	}
});
revokeOnPlayerLoadOrJoin(advancementTick, tickAdvancement);

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