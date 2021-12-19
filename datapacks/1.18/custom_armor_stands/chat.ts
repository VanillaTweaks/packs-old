import internalBasePath from 'lib/datapacks/internalBasePath';
import pack from 'lib/datapacks/pack';
import padding from 'lib/datapacks/textComponents/padding';
import page from 'lib/datapacks/textComponents/page';
import type { Score } from 'sandstone';
import { execute, tellraw } from 'sandstone';

const chat = pack.child({ directory: 'chat' });
const chat_ = internalBasePath(chat);

const FIRST_PAGE_LINK_COLOR = 'gray';
const CLICKABLE_COLOR = 'gray';
const CLICKABLE_COLOR_2 = 'gray';

export const triggerChat = (
	/** The value of the player's trigger. */
	$trigger: Score
) => {
	execute
		.if($trigger.matches(1))
		.run(chat_`main_menu`, () => {
			page({
				before: [
					{ text: ' ⏪ ', color: FIRST_PAGE_LINK_COLOR },
					padding(60)
				],
				subtitle: 'Main Menu',
				after: [
					padding(34),
					{ text: '⤺', color: CLICKABLE_COLOR, bold: true },
					'  ',
					{ text: '⟳', color: CLICKABLE_COLOR, bold: true },
					'  ',
					{ text: '⤻', color: CLICKABLE_COLOR, bold: true }
				]
			}, () => {
				tellraw('@s', [
					'    ',
					{ text: 'Select Nearest', color: CLICKABLE_COLOR },
					'\n   ',
					{ text: 'Highlight Selected', color: CLICKABLE_COLOR },
					'\n\n ',
					{ text: 'Position', color: CLICKABLE_COLOR_2 },
					'      ',
					{ text: 'Rotation', color: CLICKABLE_COLOR_2 },
					'\n ',
					{ text: 'Properties', color: CLICKABLE_COLOR_2 },
					'  ',
					{ text: 'Utilities', color: CLICKABLE_COLOR_2 },
					'\n ',
					{ text: 'Presets', color: CLICKABLE_COLOR_2 },
					'\n\n ',
					{ text: 'Head', color: CLICKABLE_COLOR_2 },
					'        ',
					{ text: 'Body', color: CLICKABLE_COLOR_2 },
					'\n ',
					{ text: 'Left Arm', color: CLICKABLE_COLOR_2 },
					'   ',
					{ text: 'Right Arm', color: CLICKABLE_COLOR_2 },
					'\n ',
					{ text: 'Left Leg', color: CLICKABLE_COLOR_2 },
					'   ',
					{ text: 'Right Leg', color: CLICKABLE_COLOR_2 }
				]);
			});
		});
};