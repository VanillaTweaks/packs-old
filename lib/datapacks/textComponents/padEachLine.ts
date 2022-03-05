import type { JSONTextComponent } from 'sandstone';
import split from 'lib/datapacks/textComponents/split';
import getSingleLineWidth from 'lib/datapacks/textComponents/getWidth/getSingleLineWidth';
import padding from 'lib/datapacks/textComponents/padding';
import join from 'lib/datapacks/textComponents/join';
import { containerWidth } from 'lib/datapacks/textComponents/withContainer';
import minify from 'lib/datapacks/textComponents/minify';
import wrap from 'lib/datapacks/textComponents/wrap';

/** Adds padding before each line of a text component (counting lines caused by wrapping), automatically minified. */
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

	return minify(join(
		split(wrap(component), '\n').map(componentLine => {
			const width = getSingleLineWidth(componentLine);

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
			const paddingWidth = getSingleLineWidth(paddingBeforeLine);

			if (width + paddingWidth > containerWidth) {
				paddingBeforeLine = padding(idealPaddingWidth, { floor: true });
			}

			return ['', paddingBeforeLine, componentLine];
		}),
		'\n'
	));
};

export default padEachLine;