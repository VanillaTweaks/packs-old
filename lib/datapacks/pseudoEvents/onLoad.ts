import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import internalBasePath from 'lib/datapacks/internalBasePath';
import { loadTag } from 'lib/datapacks/lanternLoad';
import { MCFunction } from 'sandstone';
import pack from 'lib/datapacks/pack';
import beforeSave from 'lib/beforeSave';
import setLoadStatus from 'lib/datapacks/lanternLoad/setLoadStatus';
import vt from 'lib/datapacks/vt';

/** Adds to a `BasePath`'s `load` function, which is (indirectly) called by `#minecraft:load`. */
const onLoad = (
	/** The `BasePath` to put the `load` function under. */
	basePath: VTBasePathInstance,
	callback: () => void
) => {
	setLoadStatus(vt);
	setLoadStatus(basePath);

	const basePath_ = internalBasePath(basePath);

	const loadFunction = MCFunction(basePath_`load`, callback, {
		onConflict: 'append'
	});

	// TODO: Use `!loadTag.has(loadFunction)` instead.
	if (!loadTag.values.some(value => value.toString() === loadFunction.toString())) {
		// TODO: Remove `as any`.
		loadTag.add(loadFunction as any);

		if (basePath === pack) {
			beforeSave(import('lib/datapacks/faultChecking/checkLoadTagNotLoaded'));
		}
	}
};

export default onLoad;