import pack from 'lib/datapacks/pack';
import type { BaseLocationInstance } from 'lib/datapacks/BaseLocation';
import { MCFunction } from 'sandstone';
import { setHasConfigFunction } from 'lib/datapacks/setMetaAdvancements';

/** Sets a `BaseLocation`'s config function. */
const setConfigFunction = (
	baseLocation: BaseLocationInstance,
	callback: () => void
) => {
	if (baseLocation === pack) {
		setHasConfigFunction(true);
	}

	return MCFunction(baseLocation`config`, callback);
};

export default setConfigFunction;