import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import { loadStatus } from 'lib/datapacks/lanternLoad';

/** Gets the `loadStatus` score of a `BasePath`. */
const loadStatusScore = (
	/** The `BasePath` to get the `loadStatus` score of. */
	basePath: VTBasePathInstance
) => {
	let basePathName = basePath.namespace;
	if (basePath.directory) {
		basePathName += `.${basePath.directory.replace(/\//g, '.')}`;
	}

	return loadStatus(basePathName);
};

export default loadStatusScore;