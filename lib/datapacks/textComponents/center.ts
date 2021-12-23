import type { JSONTextComponent } from 'sandstone';
import split from 'lib/datapacks/textComponents/split';
import getWidth from 'lib/datapacks/textComponents/getWidth';
import padding from 'lib/datapacks/textComponents/padding';
import join from 'lib/datapacks/textComponents/join';
import { containerWidth } from 'lib/datapacks/textComponents/container';

/**
 * Centers a text component by adding padding to the left of it, automatically minified.
 *
 * Assumes all arrays in the inputted component have elements which shouldn't inherit special formatting from the first element, so it isn't necessary to avoid special formatting on the first element of any inputted array.
 */
const center = (component: JSONTextComponent) => (
	join(
		split(component, '\n').map(componentLine => {
			const width = getWidth(componentLine);

			if (width === 0) {
				// If the line is empty, just leave it empty rather than adding useless padding.
				return '';
			}

			if (width > containerWidth) {
				throw new TypeError('The width of a line cannot exceed the width of the container.');
			}

			return [
				padding((containerWidth - width) / 2),
				componentLine
			];
		}),
		'\n'
	)
);

export default center;