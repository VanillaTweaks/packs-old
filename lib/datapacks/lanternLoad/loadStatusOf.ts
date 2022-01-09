import type { ResourceLocationInstance } from 'lib/datapacks/ResourceLocation';
import { loadStatus } from 'lib/datapacks/lanternLoad';

/** Gets the `loadStatus` score of a `ResourceLocation`. */
const loadStatusOf = (resourceLocation: ResourceLocationInstance) => (
	loadStatus(
		'$' + resourceLocation.namespace + (
			resourceLocation.path
				? `.${resourceLocation.path.replace(/\//g, '.')}`
				: ''
		)
	)
);

export default loadStatusOf;