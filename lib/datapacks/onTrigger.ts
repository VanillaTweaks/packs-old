import onLoad from 'lib/datapacks/onLoad';
import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import type { JSONTextComponent, ObjectiveInstance } from 'sandstone';
import { execute, scoreboard } from 'sandstone';
import onUninstall from 'lib/datapacks/onUninstall';
import every from 'lib/datapacks/every';
import internalBasePath from 'lib/datapacks/internalBasePath';
import objective from './objective';

/** Creates a scoreboard objective with the `trigger` criterion, adds the necessary `scoreboard` commands to the load and uninstall functions, and runs a function as any player who sets the trigger to 1 or greater. */
const onTrigger = (
	/** The `BasePath` to be used as a prefix to the objective name, and to add to the load and uninstall functions of. */
	basePath: VTBasePathInstance,
	/** The name of the scoreboard objective to create. Must contain only lowercase letters and underscores. */
	objectiveName: string,
	/** The display name of the scoreboard objective to create. */
	displayName: JSONTextComponent,
	/**
	 * What to run as players with the trigger set to 1 or greater.
	 *
	 * ⚠️ Do not reset the value of the trigger inside this callback. That is automatically handled already.
	 */
	callback: (trigger: ObjectiveInstance) => void
) => {
	if (/[^a-z_]/.test(objectiveName)) {
		// The reason the objective name shouldn't contain anything but lowercase letters and underscores is to make it easier for players to remember.
		throw new TypeError('The `objectiveName` argument of `onTrigger` must contain only lowercase letters and underscores.');
	}

	const basePath_ = internalBasePath(basePath);

	const trigger = objective(
		basePath,
		objectiveName,
		'trigger',
		displayName,
		{ namespaced: false }
	);

	every('4t', basePath, () => {
		execute
			.as(`@a[scores={${objectiveName}=1..}]`)
			// TODO: Replace the name parameter below with `` basePath_`trigger_${objectiveName}` ``.
			.run(basePath_.getResourceName(`trigger_${objectiveName}`), () => {
				callback(trigger);
			});

		scoreboard.players.enable('@a', objectiveName);
		// The reason this isn't instead placed at the end of the `execute`d function above is so the trigger still works after the player sets it to a negative value.
		scoreboard.players.set('@a', objectiveName, 0);
	});
};

export default onTrigger;