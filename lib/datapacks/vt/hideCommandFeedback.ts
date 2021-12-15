import { vt_ } from 'lib/datapacks/vt';
import { execute, gamerule, schedule } from 'sandstone';
import temp from 'lib/datapacks/vt/temp';

const $sendCommandFeedback = temp('#sendCommandFeedback');

/** Sets the `sendCommandFeedback` game rule to `false` for the rest of the tick. */
const hideCommandFeedback = () => {
	execute
		.store.result.score($sendCommandFeedback)
		.run.gamerule('sendCommandFeedback');
	execute
		.if($sendCommandFeedback.matches(1))
		.run(vt_`hide_command_feedback`, () => {
			gamerule('sendCommandFeedback', false);

			schedule.function(vt_`restore_command_feedback`, () => {
				gamerule('sendCommandFeedback', true);
			}, '1t');
		});
};

export default hideCommandFeedback;