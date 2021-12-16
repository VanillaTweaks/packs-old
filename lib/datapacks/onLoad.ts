import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import getInternalChild from 'lib/datapacks/getInternalChild';
import { loadTag } from 'lib/datapacks/lanternLoad';
import { MCFunction } from 'sandstone';

/** Adds to a `BasePath`'s load function. */
const onLoad = <
	ReturnValue extends void | Promise<void> = void | Promise<void>
>(
	/** The `BasePath` to put the load function under. */
	basePath: VTBasePathInstance,
	callback: () => ReturnValue
) => {
	const basePath_ = getInternalChild(basePath);

	const loadFunction = MCFunction(basePath_`load`, callback, {
		onConflict: 'append'
	});

	// TODO: Use `!loadTag.has(loadFunction)` instead.
	if (!loadTag.values.some(value => value.toString() === loadFunction.toString())) {
		loadTag.add(loadFunction);
	}
};

export default onLoad;