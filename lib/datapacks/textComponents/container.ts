/** The maximum width of a line of text in a book in in-game pixels. */
export const BOOK_WIDTH = 114;

/** The maximum width of a line of text in the container in in-game pixels. Defaults to `BOOK_WIDTH` when not set by `container`. */
export let containerWidth = BOOK_WIDTH;

/** Sets the width of the container for the duration of the callback. */
const container = <Return>(
	width: number,
	callback: () => Return
) => {
	containerWidth = width;

	const callbackReturn = callback();

	// Restore the container width to its default.
	containerWidth = BOOK_WIDTH;

	return callbackReturn;
};

export default container;