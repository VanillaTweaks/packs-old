import type { JSONTextComponent } from 'sandstone';
import getWidth from 'lib/datapacks/textComponents/getWidth';
import right from 'lib/datapacks/textComponents/right';
import withContainer from 'lib/datapacks/textComponents/withContainer';

/**
 * Right-aligns a text component using its own width as the container width, automatically minified.
 *
 * Disables array inheritance on the inputted component.
 */
const localRight = (component: JSONTextComponent) => (
	withContainer(getWidth(component), () => (
		right(component)
	))
);

export default localRight;