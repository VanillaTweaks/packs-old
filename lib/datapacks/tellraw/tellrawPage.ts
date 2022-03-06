import pack from 'lib/pack';
import horizontalBar from 'lib/datapacks/tellraw/horizontalBar';
import type { JSONTextComponent, MultiplePlayersArgument } from 'sandstone';
import { tellraw } from 'sandstone';
import { center, overlap } from 'minecraft-text-components';

/** Runs `tellraw` commands to display the top and bottom of a page UI. */
const tellrawPage = (
	targets: MultiplePlayersArgument,
	options: {
		/** The part of the centered text in the heading line before the slash, automatically minified. Defaults to the name of the pack. */
		title?: string,
		/** The part of the centered text in the heading line after the slash, automatically minified. */
		subtitle: string,
		/** An array of text components to overlap onto the heading line, automatically minified. */
		overlapHeadingWith?: JSONTextComponent[]
	},
	content: () => void
) => {
	horizontalBar(targets);
	tellraw(targets, overlap(
		center([
			options.title || pack.TITLE,
			{ text: ' / ', color: 'gray' },
			options.subtitle
		]),
		...options.overlapHeadingWith || []
	));
	horizontalBar(targets);

	content();

	horizontalBar(targets);
};

export default tellrawPage;