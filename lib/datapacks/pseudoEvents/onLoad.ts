import type { BaseLocationInstance } from 'lib/BaseLocation';
import { loadTag } from 'lib/datapacks/lanternLoad';
import { MCFunction } from 'sandstone';
import pack from 'lib/pack';
import beforeSave from 'lib/beforeSave';
import setLoadStatus from 'lib/datapacks/lanternLoad/setLoadStatus';
import vt from 'lib/vt';

/** Adds to a `BaseLocation`'s `load` function, which is (indirectly) called by `#minecraft:load`. */
const onLoad = (
	/** The `BaseLocation` to put the `load` function under. */
	baseLocation: BaseLocationInstance,
	callback: () => void
) => {
	setLoadStatus(vt);
	setLoadStatus(baseLocation);

	const loadFunction = MCFunction(baseLocation`_load`, callback, {
		onConflict: 'append'
	});

	// TODO: Use `!loadTag.has(loadFunction)` instead.
	if (!loadTag.values.some(value => value.toString() === loadFunction.toString())) {
		// TODO: Remove `as any`.
		loadTag.add(loadFunction as any);

		if (baseLocation === pack) {
			beforeSave(import('lib/datapacks/faultChecking/checkLoadTagNotLoaded'));
		}
	}
};

export default onLoad;