import type { ResourceLocationInstance } from 'lib/datapacks/ResourceLocation';
import { loadStatus } from 'lib/datapacks/lanternLoad';

/** Gets the `loadStatus` score of a `ResourceLocation`. */
const loadStatusOf = (
	/** The `ResourceLocation` to get the `loadStatus` score of. */
	resourceLocation: ResourceLocationInstance
) => (
	loadStatus(
		'$' + resourceLocation.namespace + (
			resourceLocation.path
				? `.${resourceLocation.path.replace(/\//g, '.')}`
				: ''
		)
	)
);

export default loadStatusOf;