import type { ResourceLocationInstance } from 'lib/datapacks/ResourceLocation';
import type { TimeArgument } from 'sandstone';
import { MCFunction, schedule } from 'sandstone';
import onLoad from 'lib/datapacks/pseudoEvents/onLoad';
import onUninstall from 'lib/datapacks/pseudoEvents/onUninstall';

/** A mapping from the namespaced name of each function which has been created by `every` to `true`. */
const existingFunctions: Partial<Record<string, true>> = {};

/** Runs a function one tick after the pack loads and then on a periodical clock. */
const every = (
	duration: Exclude<TimeArgument, number>,
	/** The `ResourceLocation` to put the clock function under. */
	resourceLocation: ResourceLocationInstance,
	callback: () => void
) => {
	const functionName = resourceLocation`_${duration === '1t' ? 'tick' : duration}`;

	/** Whether this `MCFunction` was already created by a previous `every` call. */
	const functionAlreadyExists = existingFunctions[functionName];

	const clockFunction = MCFunction(functionName, () => {
		// Ensure this function doesn't already exist to avoid adding the `schedule` command to it multiple times.
		if (!functionAlreadyExists) {
			schedule.function(clockFunction, duration);
		}

		callback();
	}, { onConflict: 'append' });

	if (!functionAlreadyExists) {
		onLoad(resourceLocation, () => {
			// This is scheduled one tick ahead so that clock functions always run after the load tag is fully complete.
			schedule.function(clockFunction, '1t');
		});

		onUninstall(resourceLocation, () => {
			schedule.clear(clockFunction);
		});
	}

	return clockFunction;
};

export default every;