import type { BaseLocationInstance } from 'lib/datapacks/BaseLocation';
import { loadStatus } from 'lib/datapacks/lanternLoad';

/** Gets the `loadStatus` score of a `BaseLocation`. */
const loadStatusOf = (baseLocation: BaseLocationInstance) => (
	loadStatus(
		'$' + baseLocation.NAMESPACE + (
			baseLocation.PATH
				? `.${baseLocation.PATH.replace(/\//g, '.')}`
				: ''
		)
	)
);

export default loadStatusOf;