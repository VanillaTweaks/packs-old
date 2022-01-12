import type { JSONTextComponent } from 'sandstone';
import padEachLine from 'lib/datapacks/textComponents/padEachLine';
import { containerWidth } from 'lib/datapacks/textComponents/withContainer';

/**
 * Centers a text component, automatically minified.
 *
 * Disables array inheritance on the inputted component.
 */
const center = (component: JSONTextComponent) => (
	padEachLine(
		component,
		width => (containerWidth - width) / 2
	)
);

export default center;