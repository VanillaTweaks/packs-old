import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import getInternalChild from 'lib/datapacks/getInternalChild';
import { loadTag } from 'lib/datapacks/lanternLoad';

/** Adds code to a `BasePath`'s load function. */
const onLoad = <
	ReturnValue extends void | Promise<void> = void | Promise<void>
>(
	/** The `BasePath` not returned from `getInternalChild` to put the load function under. */
	basePath: VTBasePathInstance,
	callback: () => ReturnValue,
	onConflict: 'append' | 'prepend' = 'append'
) => {
	const loadFunction = getInternalChild(basePath).MCFunction('load', callback, {
		onConflict
	});

	// TODO: Use `!loadTag.has(loadFunction)` instead.
	if (!loadTag.values.some(value => value.toString() === loadFunction.toString())) {
		loadTag.add(loadFunction);
	}
};

export default onLoad;