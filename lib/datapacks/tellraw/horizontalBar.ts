import { tellraw } from 'sandstone';

/** Runs a `tellraw` command to display a horizontal bar in chat to `@s`. */
const horizontalBar = () => {
	tellraw('@s', { text: ' '.repeat(80), color: 'dark_gray', strikethrough: true });
};

export default horizontalBar;