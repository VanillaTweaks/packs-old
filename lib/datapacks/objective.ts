import onLoad from 'lib/datapacks/pseudoEvents/onLoad';
import type { ResourceLocationInstance } from 'lib/datapacks/ResourceLocation';
import { Objective, scoreboard } from 'sandstone';
import onUninstall from 'lib/datapacks/pseudoEvents/onUninstall';

/**
 * Creates a scoreboard objective (namespaced by default), adds the necessary `scoreboard` commands to the load and uninstall functions, and returns an `Objective` instance.
 *
 * ⚠️ Note that there is an `onTrigger` abstraction for `trigger` objectives instead.
 */
const objective = (
	/** The `ResourceLocation` to be used as a prefix to the objective name, and to add to the load and uninstall functions of. */
	resourceLocation: ResourceLocationInstance,
	/** The non-namespaced name of this objective. */
	objectiveName: string,
	criterion: Parameters<typeof scoreboard['objectives']['add']>[1] = 'dummy',
	displayName?: Parameters<typeof scoreboard['objectives']['add']>[2],
	{ namespaced = true }: {
		/** Whether to prepend the specified `ResourceLocation`'s namespace and directory to the objective name. Defaults to `true`. */
		namespaced?: boolean
	} = {}
) => {
	const objectiveInstance = Objective.get(
		namespaced
			? resourceLocation[objectiveName]
			: objectiveName
	);

	onLoad(resourceLocation, () => {
		scoreboard.objectives.add(objectiveInstance, criterion, displayName);
	});

	onUninstall(resourceLocation, () => {
		scoreboard.objectives.remove(objectiveInstance);
	});

	return objectiveInstance;
};

export default objective;