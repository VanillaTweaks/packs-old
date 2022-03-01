import type { BaseLocationInstance } from 'lib/BaseLocation';
import type { JSONTextComponent, ObjectiveInstance } from 'sandstone';
import { execute, scoreboard } from 'sandstone';
import every from 'lib/datapacks/every';
import objective from 'lib/datapacks/objective';

/** Creates a scoreboard objective with the `trigger` criterion, adds the necessary `scoreboard` commands to the load and uninstall functions, and runs a function as any player who sets the trigger to 1 or greater. */
const onTrigger = (
	/** The `BaseLocation` to create functions under. */
	baseLocation: BaseLocationInstance,
	/** The name of the scoreboard objective to create. Must contain only lowercase letters and underscores. */
	objectiveName: string,
	/** The display name of the scoreboard objective to create. */
	displayName: JSONTextComponent,
	/**
	 * What to run as players with the trigger set to 1 or greater.
	 *
	 * ⚠️ Do not reset the value of the trigger inside this callback. That is automatically handled already.
	 */
	callback: (triggerObjective: ObjectiveInstance) => void
) => {
	if (/[^a-z_]/.test(objectiveName)) {
		// The reason the objective name shouldn't contain anything but lowercase letters and underscores is to make it easier for players to remember.
		throw new TypeError('The `objectiveName` argument of `onTrigger` must contain only lowercase letters and underscores.');
	}

	const triggerObjective = objective(
		baseLocation,
		objectiveName,
		'trigger',
		displayName,
		{ namespaced: false }
	);

	every('4t', baseLocation, () => {
		execute
			.as(`@a[scores={${objectiveName}=1..}]`)
			.run(baseLocation`_trigger_${objectiveName}`, () => {
				callback(triggerObjective);
			});

		scoreboard.players.enable('@a', objectiveName);
		// The reason this isn't instead placed at the end of the `execute`d function above is so the trigger still works after the player sets it to a negative value.
		scoreboard.players.set('@a', objectiveName, 0);
	});
};

export default onTrigger;