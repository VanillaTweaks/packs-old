import type { MCFunctionInstance, TagInstance } from 'sandstone';
import { advancement, Advancement, execute, functionCmd, MCFunction, tag, Tag } from 'sandstone';
import vt, { vt_ } from 'lib/datapacks/vt';
import revokeOnPlayerLoadOrJoin from 'lib/datapacks/revokeOnPlayerLoadOrJoin';
import internalBasePath from 'lib/datapacks/internalBasePath';
import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';

const advancementTick = vt.child({ directory: 'advancement_tick' });

const advancementTickTag = Tag('functions', vt_`advancement_tick`);

/** An advancement granted to all players every tick, unless the `function-permission-level` is too low, in which case the advancement will be granted and then never revoked. */
export const tickAdvancement = Advancement(advancementTick`tick`, {
	criteria: {
		tick: { trigger: 'minecraft:tick' }
	},
	rewards: {
		function: MCFunction(vt_`advancement_tick`, () => {
			advancement.revoke('@s').only(tickAdvancement);

			tag('@s').add(advancementTick`.self`);

			execute
				.as('@a[limit=1]')
				.if.entity(`@s[tag=${advancementTick`.self`}]`)
				// TODO: Remove `.functionCmd`.
				.run.functionCmd(advancementTickTag);

			tag('@s').remove(advancementTick`.self`);
		})
	}
});
revokeOnPlayerLoadOrJoin(advancementTick, tickAdvancement);

/** Runs something from an advancement reward function as an arbitrary player every tick. */
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