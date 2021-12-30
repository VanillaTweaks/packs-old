import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import internalBasePath from 'lib/datapacks/internalBasePath';
import { loadTag } from 'lib/datapacks/lanternLoad';
import type { MCFunctionInstance, TagInstance } from 'sandstone';
import { MCFunction } from 'sandstone';

/** Adds to a `BasePath`'s load function, or to the global load tag if a function or function tag is passed directly. */
const onLoad = (
	...args: [
		/** The `BasePath` to put the `load` function under. */
		basePath: VTBasePathInstance,
		callback: () => void
	] | [
		/** The function or function tag to add to the `loadTag`. */
		functionOrFunctionTag: MCFunctionInstance | TagInstance<'functions'>
	]
) => {
	let functionOrFunctionTag: MCFunctionInstance | TagInstance<'functions'>;

	if (args.length === 1) {
		[functionOrFunctionTag] = args;
	} else {
		const [basePath, callback] = args;
		const basePath_ = internalBasePath(basePath);

		functionOrFunctionTag = MCFunction(basePath_`load`, callback, {
			onConflict: 'append'
		});
	}

	// TODO: Use `!loadTag.has(functionOrFunctionTag)` instead.
	if (!loadTag.values.some(value => value.toString() === functionOrFunctionTag.toString())) {
		// TODO: Remove `as any`.
		loadTag.add(functionOrFunctionTag as any);
	}
};

export default onLoad;