import onLoad from 'lib/datapacks/onLoad';
import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import { scoreboard } from 'sandstone';
import onUninstall from 'lib/datapacks/onUninstall';

/**
 * Creates a namespaced scoreboard objective, adds the necessary `scoreboard` commands to the load and uninstall functions, and returns the namespaced name of the objective.
 *
 * ⚠️ Not for objectives with the `trigger` criterion. Use `onTrigger` for that instead.
 */
const objective = (
	/** The `BasePath` not returned from `getInternalChild` to be used as a prefix to the objective name, and to add to the load and uninstall functions of. */
	basePath: VTBasePathInstance,
	[objectiveName, criterion, displayName]: Parameters<typeof scoreboard['objectives']['add']>
) => {
	// TODO: Set this to `` basePath`.${objectiveName}` `` instead.
	const namespacedObjectiveName = basePath.getResourceName(objectiveName).replace(/[:/]/g, '.');

	onLoad(basePath, () => {
		scoreboard.objectives.add(namespacedObjectiveName, criterion, displayName);
	});

	onUninstall(basePath, () => {
		scoreboard.objectives.remove(namespacedObjectiveName);
	});

	return namespacedObjectiveName;
};

export default objective;