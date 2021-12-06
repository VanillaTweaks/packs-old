import pack from 'lib/datapacks/pack';
import state from 'lib/datapacks/state';
import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';

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

	return basePath.MCFunction('config', callback);
};

export default setConfigFunction;