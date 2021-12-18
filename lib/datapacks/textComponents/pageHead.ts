import * as meta from 'lib/meta';
import horizontalBar from 'lib/datapacks/textComponents/horizontalBar';
import { tellraw } from 'sandstone';
import minifyComponent from 'lib/datapacks/textComponents/minifyComponent';

/** Runs `tellraw` commands to display the head of a chat UI to `@s`. */
const pageHead = (options: {
	/**
	 * How many spaces to place before and after the center text.
	 *
	 * This should always be set to the maximum possible integer such that, when the `dev` option is set to `true`, the period does not wrap to the next line when using default Minecraft chat settings.
	 */
	spaces: number,
	/** The part of the center text before the slash. Defaults to the name of the pack. */
	title?: string,
	/** The part of the center text after the slash. Defaults to `'Global Settings'`. */
	subtitle?: string,
	/**
	 * When `true`, places a period instead of the last space in the center text.
	 *
	 * See the description of the `spaces` option for more information.
	 */
	dev?: boolean
}) => {
	horizontalBar();

	const spaces = ' '.repeat(options.spaces);
	tellraw('@s', minifyComponent([
		spaces + (options.title || meta.title),
		{ text: ' / ', color: 'gray' },
		(options.subtitle || 'Global Settings'),
		(options.dev ? `${spaces.slice(0, -1)}.` : '')
	]));

	horizontalBar();
};

export default pageHead;