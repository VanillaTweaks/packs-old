import { MCFunction, Objective, scoreboard } from 'sandstone';
import { vt_ } from 'lib/datapacks/vt';
import uninstallTag from 'lib/datapacks/vt/uninstallTag';

/** An objective only for scores that don't need to persist between ticks. */
// TODO: Use `` vt`.temp` `` instead of `'vanillatweaks.temp'`.
const temp = Objective.get('vanillatweaks.temp');

export default temp;

/** An `MCFunction` that adds the `temp` objective. Should only ever be called from `preLoadTag`. */
export const addTempObjective = MCFunction(vt_`add_temp_objective`, () => {
	// TODO: Replace all `temp.name` with `temp`.
	scoreboard.objectives.add(temp.name, 'dummy');
});

uninstallTag.add(
	MCFunction(vt_`remove_temp_objective`, () => {
		scoreboard.objectives.remove(temp.name);
	})
);