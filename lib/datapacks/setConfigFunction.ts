import pack from 'lib/datapacks/pack';
import state from 'lib/datapacks/state';
import type { RootVTBasePath } from 'lib/datapacks/withVT';

/** Sets a `BasePath`'s config function. */
const setConfigFunction = <
	ReturnValue extends void | Promise<void> = void | Promise<void>
>(
	basePath: RootVTBasePath,
	callback: () => ReturnValue
) => {
	if (basePath.namespace === pack.namespace) {
		state.hasConfigFunction = true;
	}

	return basePath.MCFunction('config', callback);
};

export default setConfigFunction;