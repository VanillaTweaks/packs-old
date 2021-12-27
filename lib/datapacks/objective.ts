import onLoad from 'lib/datapacks/onLoad';
import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import { Objective, scoreboard } from 'sandstone';
import onUninstall from 'lib/datapacks/onUninstall';

/**
 * Creates a scoreboard objective (by default, namespaced), adds the necessary `scoreboard` commands to the load and uninstall functions, and returns an `Objective` instance.
 *
 * ⚠️ Not for objectives with the `trigger` criterion. Use `onTrigger` for that instead.
 */
const objective = (
	/** The `BasePath` to be used as a prefix to the objective name, and to add to the load and uninstall functions of. */
	basePath: VTBasePathInstance,
	/** The non-namespaced name of this objective. */
	objectiveName: string,
	criterion: Parameters<typeof scoreboard['objectives']['add']>[1] = 'dummy',
	displayName?: Parameters<typeof scoreboard['objectives']['add']>[2],
	{ namespaced = true }: {
		/** Whether to prepend the specified `BasePath`'s namespace and directory to the objective name. Defaults to `true`. */
		namespaced?: boolean
	} = {}
) => {
	const objectiveInstance = Objective.get(
		namespaced
			// TODO: Use `` basePath`.${objectiveName}` `` here instead.
			? basePath.getResourceName(objectiveName).replace(/[:/]/g, '.')
			: objectiveName
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