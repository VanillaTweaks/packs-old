import minify from 'lib/datapacks/textComponents/minify';

/** Returns a `JSONTextComponent` of a combination of plain and bold spaces to achieve a specified width in pixels. */
const padding = (
	/** The number of pixels to generate spaces for. */
	pixels: number
) => {
	if (!Number.isInteger(pixels) || (
		pixels < 12 && ![4, 5, 8, 9, 10].includes(pixels)
	)) {
		throw TypeError(`The number of pixels cannot be ${pixels}.`);
	}

	const boldSpaces = pixels % 4;
	const plainSpaces = Math.floor(pixels / 4) - boldSpaces;

	return minify([
		' '.repeat(plainSpaces),
		{ text: ' '.repeat(boldSpaces), bold: true }
	]);
};

export default padding;