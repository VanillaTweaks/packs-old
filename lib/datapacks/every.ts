import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';

/** Runs a function on load and then on a periodical schedule. */
const every = (
	basePath: VTBasePathInstance,
	duration: string,
	callback: () => void
) => {
	basePath.MCFunction(
		duration === '1t' ? 'tick' : duration,
		callback,
		{ runEvery: duration }
	);
};

export default every;