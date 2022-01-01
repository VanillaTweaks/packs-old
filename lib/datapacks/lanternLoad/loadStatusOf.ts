import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import { loadStatus } from 'lib/datapacks/lanternLoad';

/** Gets the `loadStatus` score of a `BasePath`. */
const loadStatusOf = (
	/** The `BasePath` to get the `loadStatus` score of. */
	basePath: VTBasePathInstance
) => (
	loadStatus(
		'$' + basePath.namespace + (
			basePath.directory
				? `.${basePath.directory.replace(/\//g, '.')}`
				: ''
		)
	)
);

export default loadStatusOf;