import minify from 'lib/datapacks/textComponents/minify';

/** Returns a `JSONTextComponent` of a combination of plain and bold spaces to achieve a specified width in in-game pixels. */
const padding = (
	/** The number of in-game pixels to generate spaces for. */
	width: number
) => {
	// If the width is small but non-zero, then round up to the smallest valid width.
	if (width > 0 && width < 4) {
		width = 4;
	}

	// Ensure the width is an integer.
	width = Math.floor(width);

	// Round down for other invalid widths.
	if (width === 6) {
		width = 5;
	} else if (width === 11) {
		width = 10;
	}

	if (width <= 0) {
		throw TypeError('The padding width must be greater than 0.');
	}

	const boldSpaces = width % 4;
	const plainSpaces = Math.floor(width / 4) - boldSpaces;

	return minify([
		' '.repeat(plainSpaces),
		{ text: ' '.repeat(boldSpaces), bold: true }
	]);
};

export default padding;