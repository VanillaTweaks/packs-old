import type { JSONTextComponent } from 'sandstone';
import getWidth from 'lib/datapacks/textComponents/getWidth';
import center from 'lib/datapacks/textComponents/center';
import setContainer from 'lib/datapacks/textComponents/setContainer';

/**
 * Centers each of a text component's lines using its own width as the container width, automatically minified.
 *
 * Assumes all arrays in the inputted component have elements which shouldn't inherit special formatting from the first element, so it isn't necessary to avoid special formatting on the first element of any inputted array.
 */
const localCenter = (component: JSONTextComponent) => (
	setContainer(getWidth(component), () => (
		center(component)
	))
);

export default localCenter;