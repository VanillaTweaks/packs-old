import type { ResourceLocationInstance } from 'lib/datapacks/ResourceLocation';
import { loadTag } from 'lib/datapacks/lanternLoad';
import { MCFunction } from 'sandstone';
import pack from 'lib/datapacks/pack';
import beforeSave from 'lib/beforeSave';
import setLoadStatus from 'lib/datapacks/lanternLoad/setLoadStatus';
import vt from 'lib/datapacks/vt';

/** Adds to a `ResourceLocation`'s `load` function, which is (indirectly) called by `#minecraft:load`. */
const onLoad = (
	/** The `ResourceLocation` to put the `load` function under. */
	resourceLocation: ResourceLocationInstance,
	callback: () => void
) => {
	setLoadStatus(vt);
	setLoadStatus(resourceLocation);

	const loadFunction = MCFunction(resourceLocation`_load`, callback, {
		onConflict: 'append'
	});

	// TODO: Use `!loadTag.has(loadFunction)` instead.
	if (!loadTag.values.some(value => value.toString() === loadFunction.toString())) {
		// TODO: Remove `as any`.
		loadTag.add(loadFunction as any);

		if (resourceLocation === pack) {
			beforeSave(import('lib/datapacks/faultChecking/checkLoadTagNotLoaded'));
		}
	}
};

export default onLoad;