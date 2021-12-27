import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import internalBasePath from 'lib/datapacks/internalBasePath';
import { loadTag } from 'lib/datapacks/lanternLoad';
import { MCFunction } from 'sandstone';

/** Adds to a `BasePath`'s load function. */
const onLoad = (
	/** The `BasePath` to put the load function under. */
	basePath: VTBasePathInstance,
	callback: () => void
) => {
	const basePath_ = internalBasePath(basePath);

	const loadFunction = MCFunction(basePath_`load`, callback, {
		onConflict: 'append'
	});

	// TODO: Use `!loadTag.has(loadFunction)` instead.
	if (!loadTag.values.some(value => value.toString() === loadFunction.toString())) {
		loadTag.add(loadFunction);
	}
};

export default onLoad;