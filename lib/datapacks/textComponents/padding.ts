import minify from 'lib/datapacks/textComponents/minify';

/**
 * Returns a `JSONTextComponent` of a combination of plain and bold spaces to achieve a specified width in in-game pixels.
 *
 * The width must be a natural number and cannot be 1, 2, 3, 6, or 11.
 */
const padding = (
	/**
	 * The number of in-game pixels to generate spaces for.
	 *
	 * Must be a natural number and cannot be 1, 2, 3, 6, or 11.
	 */
	width: number
) => {
	if (width === 0) {
		return '';
	}

	if (!Number.isInteger(width) || (
		width < 12 && ![4, 5, 8, 9, 10].includes(width)
	)) {
		throw TypeError(`The padding width cannot be ${width}.`);
	}

	const boldSpaces = width % 4;
	const plainSpaces = Math.floor(width / 4) - boldSpaces;

	return minify([
		' '.repeat(plainSpaces),
		{ text: ' '.repeat(boldSpaces), bold: true }
	]);
};

export default padding;

/** Same as `padding`, except will round down if the specified width is invalid. */
export const roundedPadding = (width: number) => {
	if (width > 0 && width < 4) {
		width = 4;
	} else if (width === 6) {
		width = 5;
	} else if (width === 11) {
		width = 10;
	} else if (!Number.isInteger(width)) {
		width = Math.floor(width);
	}

	return padding(width);
};