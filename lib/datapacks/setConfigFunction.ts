import pack from 'lib/datapacks/pack';
import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import { MCFunction } from 'sandstone';
import { setHasConfigFunction } from 'lib/datapacks/pack/setMetaAdvancements';

/** Sets a `BasePath`'s config function. */
const setConfigFunction = (
	basePath: VTBasePathInstance,
	callback: () => void
) => {
	if (basePath.namespace === pack.namespace) {
		setHasConfigFunction(true);
	}

	return MCFunction(basePath`config`, callback);
};

export default setConfigFunction;