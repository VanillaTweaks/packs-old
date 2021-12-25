import type { JSONTextComponent } from 'sandstone';
import split from 'lib/datapacks/textComponents/split';
import join from 'lib/datapacks/textComponents/join';

/**
 * Removes all consecutive whitespace from the start and end of the specified text component.
 *
 * Assumes all arrays in the inputted component have elements which shouldn't inherit special formatting from the first element, so it isn't necessary to avoid special formatting on the first element of any inputted array.
 */
const trim = (component: JSONTextComponent) => (
	join(
		// Split the component so that the start and end whitespace can easily be sliced off.
		split(component, /([^ ]+)/).slice(1, -1)
	)
);

export default trim;