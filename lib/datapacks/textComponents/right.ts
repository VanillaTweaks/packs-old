import type { JSONTextComponent } from 'sandstone';
import padEachLine from 'lib/datapacks/textComponents/padEachLine';
import { containerWidth } from 'lib/datapacks/textComponents/setContainer';

/**
 * Right-aligns a text component, automatically minified.
 *
 * Assumes all arrays in the inputted component have elements which shouldn't inherit special formatting from the first element, so it isn't necessary to avoid special formatting on the first element of any inputted array.
 */
const right = (component: JSONTextComponent) => (
	padEachLine(
		component,
		width => containerWidth - width
	)
);

export default right;