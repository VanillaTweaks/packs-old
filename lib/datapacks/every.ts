import type { RootVTBasePath } from 'lib/datapacks/withVT';

/** Runs a function on load and then on a periodical schedule. */
const every = (
	basePath: RootVTBasePath,
	duration: string,
	callback: () => void
) => {
	basePath.MCFunction(
		duration === '1t' ? 'tick' : duration,
		callback,
		{ runEach: duration }
	);
};

export default every;