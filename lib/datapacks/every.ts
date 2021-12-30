import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import type { TimeArgument } from 'sandstone';
import { MCFunction, schedule } from 'sandstone';
import internalBasePath from 'lib/datapacks/internalBasePath';
import onLoad from 'lib/datapacks/onLoad';
import onUninstall from 'lib/datapacks/onUninstall';

/** A mapping from the namespaced name of each function which has been created by `every` to `true`. */
const existingFunctions: Partial<Record<string, true>> = {};

/** Runs a function one tick after the pack loads and then on a periodical clock. */
const every = (
	duration: Exclude<TimeArgument, number>,
	/** The `BasePath` to put the clock function under. */
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

	const clockFunction = MCFunction(functionName, () => {
		// Ensure this function doesn't already exist to avoid adding the `schedule` command to it multiple times.
		if (!functionAlreadyExists) {
			schedule.function(clockFunction, duration);
		}

		callback();
	}, { onConflict: 'append' });

	if (!functionAlreadyExists) {
		onLoad(basePath, () => {
			// This is scheduled one tick ahead so that clock functions always run after the load tag is fully complete.
			schedule.function(clockFunction, '1t');
		});

		onUninstall(basePath, () => {
			schedule.clear(clockFunction);
		});
	}

	return clockFunction;
};

export default every;