import pack from 'lib/datapacks/pack';
import state from 'lib/datapacks/state';
import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import { MCFunction } from 'sandstone';

/** Sets a `BasePath`'s config function. */
const setConfigFunction = <
	ReturnValue extends void | Promise<void> = void | Promise<void>
>(
	basePath: VTBasePathInstance,
	callback: () => ReturnValue
) => {
	if (basePath.namespace === pack.namespace) {
		state.hasConfigFunction = true;
	}

	return MCFunction(basePath`config`, callback);
};

export default setConfigFunction;