import * as meta from 'lib/meta';
import horizontalBar from 'lib/datapacks/textComponents/horizontalBar';
import type { JSONTextComponent } from 'sandstone';
import { tellraw } from 'sandstone';
import minify from 'lib/datapacks/textComponents/minify';

/** Runs `tellraw` commands to display the top and bottom of a page UI to `@s`. */
const page = (
	options: {
		/** Content placed directly before the title, minified automatically. Put `padding` here. */
		before?: JSONTextComponent,
		/** The part of the center text before the slash, minified automatically. Defaults to the name of the pack. */
		title?: string,
		/** The part of the center text after the slash, minified automatically. */
		subtitle: string,
		/** Content placed directly after the subtitle, minified automatically. */
		after?: JSONTextComponent
	},
	content: () => void
) => {
	horizontalBar();
	tellraw('@s', minify([
		'',
		options.before || '',
		options.title || meta.title,
		{ text: ' / ', color: 'gray' },
		options.subtitle,
		options.after || ''
	]));
	horizontalBar();

	content();

	horizontalBar();
};

export default page;