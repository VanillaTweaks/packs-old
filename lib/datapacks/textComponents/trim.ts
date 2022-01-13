import type { JSONTextComponent } from 'sandstone';
import split from 'lib/datapacks/textComponents/split';
import join from 'lib/datapacks/textComponents/join';

/** Removes all consecutive whitespace from the start and end of the specified text component. */
const trim = (component: JSONTextComponent) => (
	join(
		// Split the component so that the start and end whitespace can easily be sliced off.
		split(component, /(\S+)/).slice(1, -1),
		''
	)
);

export default trim;