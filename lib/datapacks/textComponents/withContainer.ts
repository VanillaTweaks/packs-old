/** The maximum width of a line of text in chat with default settings in in-game pixels. */
export const CHAT = 320;

/** The maximum width of a line of text in a book in in-game pixels. */
export const BOOK = 114;

/** The maximum width of a line of text in the container in in-game pixels. Defaults to `CHAT` when not set by `withContainer`. */
export let containerWidth = CHAT;

/** Sets the width of the container for the duration of the callback. */
const withContainer = <Return>(
	width: number,
	callback: () => Return
) => {
	const previousContainerWidth = containerWidth;
	containerWidth = width;

	const callbackReturn = callback();

	containerWidth = previousContainerWidth;

	return callbackReturn;
};

export default withContainer;