import pack from 'lib/datapacks/pack';
import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import { MCFunction } from 'sandstone';
import { setHasConfigFunction } from 'lib/datapacks/setMetaAdvancements';

/** Sets a `BasePath`'s config function. */
const setConfigFunction = (
	basePath: VTBasePathInstance,
	callback: () => void
) => {
	if (basePath === pack) {
		setHasConfigFunction(true);
	}

	return MCFunction(basePath`config`, callback);
};

export default setConfigFunction;