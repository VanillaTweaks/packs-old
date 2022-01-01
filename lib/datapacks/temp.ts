import { MCFunction, Objective, scoreboard } from 'sandstone';
import vt from 'lib/datapacks/vt';
import internalBasePath from 'lib/datapacks/internalBasePath';
import onUninstall from 'lib/datapacks/pseudoEvents/onUninstall';

const tempObjective = vt.child({ directory: 'temp_objective' });
const tempObjective_ = internalBasePath(tempObjective);

/** An objective only for scores that don't need to persist between ticks. */
// TODO: Use `` vt`.temp` `` instead of `'vanillatweaks.temp'`.
const temp = Objective.get('vanillatweaks.temp');

export default temp;

/**
 * An `MCFunction` that adds the `temp` objective.
 *
 * ⚠️ Should only ever be called from `preLoadTag`.
 */
export const loadTempObjective = MCFunction(tempObjective_`load`, () => {
	// Adding the temp objective must be the first command in the function so that it still runs when the `maxCommandChainLength` is 1.
	// TODO: Replace all `temp.name` with `temp`.
	scoreboard.objectives.add(temp.name, 'dummy');

	// Reset all temp scores just to periodically keep the scoreboard a bit cleaner.
	scoreboard.players.reset('*', temp.name);
});

onUninstall(tempObjective, () => {
	scoreboard.objectives.remove(temp.name);
});