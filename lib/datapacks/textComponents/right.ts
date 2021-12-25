import type { JSONTextComponent } from 'sandstone';
import split from 'lib/datapacks/textComponents/split';
import getWidth from 'lib/datapacks/textComponents/getWidth';
import padding from 'lib/datapacks/textComponents/padding';
import join from 'lib/datapacks/textComponents/join';
import { containerWidth } from 'lib/datapacks/textComponents/container';
import minify from 'lib/datapacks/textComponents/minify';
import trim from 'lib/datapacks/textComponents/trim';

/**
 * Right-aligns a text component by trimming its whitespace and adding padding to the left of it, automatically minified.
 *
 * Assumes all arrays in the inputted component have elements which shouldn't inherit special formatting from the first element, so it isn't necessary to avoid special formatting on the first element of any inputted array.
 */
const right = (component: JSONTextComponent) => (
	join(
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

			return [
				padding(containerWidth - width),
				componentLine
			];
		}),
		'\n'
	)
);

export default right;