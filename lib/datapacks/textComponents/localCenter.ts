import type { JSONTextComponent } from 'sandstone';
import getWidth from 'lib/datapacks/textComponents/getWidth';
import center from 'lib/datapacks/textComponents/center';
import withContainer from 'lib/datapacks/textComponents/withContainer';

/** Centers a text component using its own width as the container width, automatically minified. */
const localCenter = (component: JSONTextComponent) => (
	withContainer(getWidth(component), () => (
		center(component)
	))
);

export default localCenter;