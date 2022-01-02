import { MCFunction, Objective, scoreboard } from 'sandstone';
import vt from 'lib/datapacks/vt';
import internalBasePath from 'lib/datapacks/internalBasePath';
import onUninstall from 'lib/datapacks/pseudoEvents/onUninstall';

const tempObjective = vt.child({ directory: 'temp_objective' });
const tempObjective_ = internalBasePath(tempObjective);

/** An objective only for temporary scores that can safely be reset anytime. */
// TODO: Use `` vt`.temp` `` instead of `'vanillatweaks.temp'`.
const temp = Objective.get('vanillatweaks.temp');

export default temp;

/**
 * An `MCFunction` that adds the `temp` objective.
 *
 * ⚠️ Should only ever be called from `preLoadTag` and `advancementTickTag`.
 */
export const addTempObjective = MCFunction(tempObjective_`add`, () => {
	// This function must only have one command so it still runs when the `maxCommandChainLength` is 1.

	// TODO: Replace all `temp.name` with `temp`.
	scoreboard.objectives.add(temp.name, 'dummy');
});

onUninstall(tempObjective, () => {
	scoreboard.objectives.remove(temp.name);
});