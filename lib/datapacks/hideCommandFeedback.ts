import vt from 'lib/vt';
import { execute, gamerule, schedule } from 'sandstone';
import temp from 'lib/datapacks/temp';

const $sendCommandFeedback = temp('$send_command_feedback');

/** Sets the `sendCommandFeedback` game rule to `false` for the rest of the tick. */
const hideCommandFeedback = () => {
	execute
		.store.result.score($sendCommandFeedback)
		.run.gamerule('sendCommandFeedback');
	execute
		.if($sendCommandFeedback.matches(1))
		.run(vt`_hide_command_feedback`, () => {
			gamerule('sendCommandFeedback', false);

			schedule.function(vt`_restore_command_feedback`, () => {
				gamerule('sendCommandFeedback', true);
			}, '1t');
		});
};

export default hideCommandFeedback;