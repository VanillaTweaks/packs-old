import pack from 'lib/datapacks/pack';
import type { ResourceLocationInstance } from 'lib/datapacks/ResourceLocation';
import { MCFunction } from 'sandstone';
import { setHasConfigFunction } from 'lib/datapacks/setMetaAdvancements';

/** Sets a `ResourceLocation`'s config function. */
const setConfigFunction = (
	resourceLocation: ResourceLocationInstance,
	callback: () => void
) => {
	if (resourceLocation === pack) {
		setHasConfigFunction(true);
	}

	return MCFunction(resourceLocation`config`, callback);
};

export default setConfigFunction;