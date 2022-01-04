import type { JSONTextComponent } from 'sandstone';
import getWidth from 'lib/datapacks/textComponents/getWidth';
import right from 'lib/datapacks/textComponents/right';
import setContainer from 'lib/datapacks/textComponents/setContainer';

/**
 * Right-aligns a text component using its own width as the container width, automatically minified.
 *
 * Assumes all arrays in the inputted component have elements which shouldn't inherit special formatting from the first element, so it isn't necessary to avoid special formatting on the first element of any inputted array.
 */
const localRight = (component: JSONTextComponent) => (
	setContainer(getWidth(component), () => (
		right(component)
	))
);

export default localRight;