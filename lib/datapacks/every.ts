import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import { schedule } from 'sandstone';
import getInternalChild from 'lib/datapacks/getInternalChild';
import onLoad from 'lib/datapacks/onLoad';

/** Runs a function one tick after the pack loads and then on a periodical schedule. */
const every = (
	duration: string,
	/** The `BasePath` not returned from `getInternalChild` to put the scheduled function under. */
	basePath: VTBasePathInstance,
	callback: () => void
) => {
	const functionName = duration === '1t' ? 'tick' : duration;

	const scheduledFunction = getInternalChild(basePath).MCFunction(functionName, () => {
		schedule.function(scheduledFunction, duration);

		callback();
	});

	onLoad(basePath, () => {
		// This is scheduled one tick ahead so that scheduled functions always run after `#load:_private/load` is fully complete.
		schedule.function(scheduledFunction, '1t');
	});
};

export default every;