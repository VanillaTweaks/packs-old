import { MCFunction, Objective, scoreboard } from 'sandstone';
import vt from 'lib/datapacks/vt';
import internalBasePath from 'lib/datapacks/internalBasePath';
import onUninstall from 'lib/datapacks/onUninstall';

const tempObjective = vt.child({ directory: 'temp_objective' });
const tempObjective_ = internalBasePath(tempObjective);

/** An objective only for scores that don't need to persist between ticks. */
// TODO: Use `` vt`.temp` `` instead of `'vanillatweaks.temp'`.
const temp = Objective.get('vanillatweaks.temp');

export default temp;

/** An `MCFunction` that adds the `temp` objective. Should only ever be called from `preLoadTag`. */
export const addTempObjective = MCFunction(tempObjective_`add`, () => {
	// TODO: Replace all `temp.name` with `temp`.
	scoreboard.objectives.add(temp.name, 'dummy');
});

onUninstall(tempObjective, () => {
	scoreboard.objectives.remove(temp.name);
});