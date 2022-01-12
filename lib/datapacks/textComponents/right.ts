import type { JSONTextComponent } from 'sandstone';
import padEachLine from 'lib/datapacks/textComponents/padEachLine';
import { containerWidth } from 'lib/datapacks/textComponents/withContainer';

/**
 * Right-aligns a text component, automatically minified.
 *
 * Disables array inheritance on the inputted component.
 */
const right = (component: JSONTextComponent) => (
	padEachLine(
		component,
		width => containerWidth - width
	)
);

export default right;