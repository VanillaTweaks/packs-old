import { VT, VT_ } from 'modules/datapacks/vanillatweaks';
import { execute, gamerule, schedule } from 'sandstone';

/** Sets the `sendCommandFeedback` game rule to `false` for the rest of the tick. */
export const hideCommandFeedback = () => {
	execute.store.result.score('#sendCommandFeedback', VT.temp).run.gamerule('sendCommandFeedback');
	execute.if.score('#sendCommandFeedback', VT.temp, 'matches', 1).run(VT_`hide_command_feedback`, () => {
		gamerule('sendCommandFeedback', false);
		schedule.function(VT_`restore_command_feedback`, () => {
			gamerule('sendCommandFeedback', true);
		}, '1t');
	});
};