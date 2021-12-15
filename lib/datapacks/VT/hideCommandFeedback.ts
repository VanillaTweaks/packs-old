import { VT_ } from 'lib/datapacks/VT';
import { execute, gamerule, schedule } from 'sandstone';
import temp from 'lib/datapacks/VT/temp';

const $sendCommandFeedback = temp('#sendCommandFeedback');

/** Sets the `sendCommandFeedback` game rule to `false` for the rest of the tick. */
const hideCommandFeedback = () => {
	execute
		.store.result.score($sendCommandFeedback)
		.run.gamerule('sendCommandFeedback');
	execute
		.if($sendCommandFeedback.matches(1))
		.run(VT_`hide_command_feedback`, () => {
			gamerule('sendCommandFeedback', false);

			schedule.function(VT_`restore_command_feedback`, () => {
				gamerule('sendCommandFeedback', true);
			}, '1t');
		});
};

export default hideCommandFeedback;