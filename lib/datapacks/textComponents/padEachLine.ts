import type { JSONTextComponent } from 'sandstone';
import split from 'lib/datapacks/textComponents/split';
import getWidth from 'lib/datapacks/textComponents/getWidth';
import padding from 'lib/datapacks/textComponents/padding';
import join from 'lib/datapacks/textComponents/join';
import { containerWidth } from 'lib/datapacks/textComponents/container';
import minify from 'lib/datapacks/textComponents/minify';
import trim from 'lib/datapacks/textComponents/trim';

/**
 * Adds padding before each of a text component's lines, automatically minified.
 *
 * Assumes all arrays in the inputted component have elements which shouldn't inherit special formatting from the first element, so it isn't necessary to avoid special formatting on the first element of any inputted array.
 */
const padEachLine = (
	component: JSONTextComponent,
	/** The ideal amount of padding to insert before each line in in-game pixels, or a function which returns the ideal amount of padding for each line it's called on. */
	idealPaddingWidth: number | (
		(
			/** The width of the line (with start and end whitespaced trimmed off) in in-game pixels. */
			width: number
		) => number
	)
) => {
	const idealPaddingWidthArgument = idealPaddingWidth;
	const getIdealPaddingWidth = (
		typeof idealPaddingWidthArgument === 'number'
			? () => idealPaddingWidthArgument
			: idealPaddingWidthArgument
	);

	return join(
		split(component, '\n').map(untrimmedComponentLine => {
			const componentLine = trim(untrimmedComponentLine);
			const width = getWidth(componentLine);

			if (width === 0) {
				// If the line is empty, just leave it empty rather than adding useless padding.
				return '';
			}

			if (width > containerWidth) {
				throw new TypeError(
					'The width of the following line exceeds the width of the container:\n'
					+ JSON.stringify(minify(componentLine))
				);
			}

			idealPaddingWidth = getIdealPaddingWidth(width);
			let paddingBeforeLine = padding(idealPaddingWidth);
			const paddingWidth = getWidth(paddingBeforeLine);

			if (width + paddingWidth > containerWidth) {
				paddingBeforeLine = padding(idealPaddingWidth, { floor: true });
			}

			return [paddingBeforeLine, componentLine];
		}),
		'\n'
	);
};

export default padEachLine;