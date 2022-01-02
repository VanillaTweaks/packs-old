/** The maximum width of a line of text in a book in in-game pixels. */
export const BOOK = 114;

/** The maximum width of a line of text in chat with default settings in in-game pixels. */
export const CHAT = 320;

/** The maximum width of a line of text in the setContainer in in-game pixels. Defaults to `BOOK_WIDTH` when not set by `setContainer`. */
export let containerWidth = BOOK;

/** Sets the width of the setContainer for the duration of the callback. */
const setContainer = <Return>(
	width: number,
	callback: () => Return
) => {
	const previousContainerWidth = containerWidth;
	containerWidth = width;

	const callbackReturn = callback();

	containerWidth = previousContainerWidth;

	return callbackReturn;
};

export default setContainer;