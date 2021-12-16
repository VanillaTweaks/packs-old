import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import type { TimeArgument } from 'sandstone';
import { MCFunction, schedule } from 'sandstone';
import internalBasePath from 'lib/datapacks/internalBasePath';
import onLoad from 'lib/datapacks/onLoad';

/** A mapping from the namespaced name of each function which has been created by `every` to `true`. */
const existingFunctions: Partial<Record<string, true>> = {};

/** Runs a function one tick after the pack loads and then on a periodical schedule. */
const every = (
	duration: Exclude<TimeArgument, number>,
	/** The `BasePath` to put the scheduled function under. */
	basePath: VTBasePathInstance,
	callback: () => void
) => {
	const _basePath = internalBasePath(basePath);

	// TODO: Set this to `` _basePath`${duration === '1t' ? 'tick' : duration}` `` instead.
	const functionName = _basePath.getResourceName(
		duration === '1t' ? 'tick' : duration
	);

	/** Whether the function was already created by a previous `every` call. */
	const functionAlreadyExists = existingFunctions[functionName];

	const scheduledFunction = MCFunction(functionName, () => {
		// Ensure this function doesn't already exist to avoid adding the `schedule` command to it multiple times.
		if (!functionAlreadyExists) {
			schedule.function(scheduledFunction, duration);
		}

		callback();
	}, { onConflict: 'append' });

	if (!functionAlreadyExists) {
		onLoad(basePath, () => {
			// This is scheduled one tick ahead so that scheduled functions always run after `#load:_private/load` is fully complete.
			schedule.function(scheduledFunction, '1t');
		});
	}
};

export default every;