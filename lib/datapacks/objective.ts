import onLoad from 'lib/datapacks/onLoad';
import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import { Objective, scoreboard } from 'sandstone';
import onUninstall from 'lib/datapacks/onUninstall';

/**
 * Creates a namespaced scoreboard objective, adds the necessary `scoreboard` commands to the load and uninstall functions, and returns an `Objective` instance.
 *
 * ⚠️ Not for objectives with the `trigger` criterion. Use `onTrigger` for that instead.
 */
const objective = (
	/** The `BasePath` to be used as a prefix to the objective name, and to add to the load and uninstall functions of. */
	basePath: VTBasePathInstance,
	[objectiveName, criterion, displayName]: Parameters<typeof scoreboard['objectives']['add']>
) => {
	const objectiveInstance = Objective.get(
		// TODO: Use `` basePath`.${objectiveName}` `` here instead.
		basePath.getResourceName(objectiveName).replace(/[:/]/g, '.')
	);

	onLoad(basePath, () => {
		// TODO: Replace all `objectiveInstance.name` with `objectiveInstance`.
		scoreboard.objectives.add(objectiveInstance.name, criterion, displayName);
	});

	onUninstall(basePath, () => {
		scoreboard.objectives.remove(objectiveInstance.name);
	});

	return objectiveInstance;
};

export default objective;