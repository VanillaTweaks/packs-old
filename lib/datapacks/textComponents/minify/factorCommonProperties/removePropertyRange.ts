import type { FlatJSONTextComponent } from 'lib/datapacks/textComponents/flatten';
import type PropertyBoundary from 'lib/datapacks/textComponents/minify/factorCommonProperties/PropertyBoundary';
import type PropertyStart from 'lib/datapacks/textComponents/minify/factorCommonProperties/PropertyStart';
import adjustPropertyIndexes from 'lib/datapacks/textComponents/minify/factorCommonProperties/adjustPropertyIndexes';

/** Removes a property range's `PropertyBoundary`s from the `nodes` array. */
const removePropertyRange = (
	nodes: Array<FlatJSONTextComponent | PropertyBoundary>,
	properties: PropertyStart[],
	/** The `PropertyStart` of the property range to remove. */
	property: PropertyStart
) => {
	nodes.splice(property.end.index, 1);
	nodes.splice(property.index, 1);

	adjustPropertyIndexes(properties, index => {
		if (index > property.index) {
			if (index > property.end.index) {
				// Removing `property.end` will shift this to the left.
				index--;
			}

			// Removing `property` will shift this to the left.
			index--;
		}

		return index;
	});
};

export default removePropertyRange;