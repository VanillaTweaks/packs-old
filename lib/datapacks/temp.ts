import { MCFunction, Objective, scoreboard } from 'sandstone';
import vt from 'lib/datapacks/vt';
import onUninstall from 'lib/datapacks/pseudoEvents/onUninstall';

const tempObjective = vt.getChild('temp_objective');

/** An objective only for temporary scores that can safely be reset anytime. */
const temp = Objective.get(vt.temp);

export default temp;

/**
 * An `MCFunction` that adds the `temp` objective.
 *
 * ⚠️ Should only ever be called from `preLoadTag`.
 */
export const loadTempObjective = MCFunction(tempObjective`_load`, () => {
	// Adding the temp objective must be the first command in the function so that it still runs when the `maxCommandChainLength` is 1.
	scoreboard.objectives.add(temp, 'dummy');

	// Reset all temp scores just to periodically keep the scoreboard a bit cleaner.
	scoreboard.players.reset('*', temp);
});

onUninstall(tempObjective, () => {
	scoreboard.objectives.remove(temp);
});