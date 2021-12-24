import pack from 'lib/datapacks/pack';
import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import { MCFunction } from 'sandstone';
import { setHasConfigFunction } from 'lib/datapacks/pack/setMetaAdvancements';

/** Sets a `BasePath`'s config function. */
const setConfigFunction = <
	ReturnValue extends void | Promise<void> = void | Promise<void>
>(
	basePath: VTBasePathInstance,
	callback: () => ReturnValue
) => {
	if (basePath.namespace === pack.namespace) {
		setHasConfigFunction(true);
	}

	return MCFunction(basePath`config`, callback);
};

export default setConfigFunction;