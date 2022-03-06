import type { MultiplePlayersArgument } from 'sandstone';
import { tellraw } from 'sandstone';
import { containerWidth, whitespace } from 'minecraft-text-components';

/** Runs a `tellraw` command to display a horizontal bar in chat. */
const horizontalBar = (targets: MultiplePlayersArgument) => {
	tellraw(targets, {
		// Subtract `containerWidth % 4` to ensure we only get plain spaces.
		text: whitespace(containerWidth - containerWidth % 4) as string,
		color: 'dark_gray',
		strikethrough: true
	});
};

export default horizontalBar;