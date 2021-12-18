import * as meta from 'lib/meta';
import horizontalBar from 'lib/datapacks/textComponents/horizontalBar';
import type { JSONTextComponent } from 'sandstone';
import { tellraw } from 'sandstone';
import minifyComponent from 'lib/datapacks/textComponents/minifyComponent';

/** Runs `tellraw` commands to display the head of a chat UI to `@s`. */
const pageHead = (options: {
	/** Content placed directly before the title. Put `padding` here. */
	before?: JSONTextComponent,
	/** The part of the center text before the slash. Defaults to the name of the pack. */
	title?: string,
	/** The part of the center text after the slash. Defaults to `'Global Settings'`. */
	subtitle?: string,
	/** Content placed directly after the subtitle. */
	after?: JSONTextComponent
}) => {
	horizontalBar();

	tellraw('@s', minifyComponent([
		options.before || '',
		options.title || meta.title,
		{ text: ' / ', color: 'gray' },
		options.subtitle || 'Global Settings',
		options.after || ''
	]));

	horizontalBar();
};

export default pageHead;