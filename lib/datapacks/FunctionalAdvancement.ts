import type { AdvancementJSON } from 'sandstone';
import { Advancement, MCFunction } from 'sandstone';
import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import getInternalChild from 'lib/datapacks/getInternalChild';

/**
 * Creates an `Advancement` to be used only for the sake of its reward function.
 *
 * Use this instead of `Advancement` whenever applicable.
 */
const FunctionalAdvancement = (
	/** The `BasePath` to create the advancement and the reward function under. */
	basePath: VTBasePathInstance,
	/** The name of the advancement and the reward function. */
	name: string,
	criterion: AdvancementJSON['criteria'][0],
	/** What to run inside the reward function. */
	callback: () => void
) => {
	const basePath_ = getInternalChild(basePath);

	// TODO: Replace all `.getResourceName(name)` with `` `${name}` ``.
	return Advancement(basePath.getResourceName(name), {
		criteria: {
			[name]: criterion
		},
		rewards: {
			function: (
				MCFunction(basePath_.getResourceName(name), callback)
			)
		}
	});
};

export default FunctionalAdvancement;