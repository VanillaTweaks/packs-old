import type { FlatJSONTextComponent } from 'lib/datapacks/textComponents/flatten';
import type PropertyBoundary from 'lib/datapacks/textComponents/minify/factorCommonProperties/PropertyBoundary';
import PropertyStart from 'lib/datapacks/textComponents/minify/factorCommonProperties/PropertyStart';
import adjustPropertyIndexes from 'lib/datapacks/textComponents/minify/factorCommonProperties/adjustPropertyIndexes';

/**
 * Ends the specified property range before the specified index and starts it again after that index.
 *
 * Returns the newly created property to the right of the split. The original property is mutated and remains to the left of the split.
 *
 * ⚠️ Assumes the specified index is inside the range of the specified property.
 */
const splitPropertyRange = (
	nodes: Array<FlatJSONTextComponent | PropertyBoundary>,
	properties: PropertyStart[],
	/** The `PropertyStart` of the property range to split. */
	leftProperty: PropertyStart,
	/** The index in `nodes` to split the property range around. */
	splitIndex: number
) => {
	const rightProperty = new PropertyStart(leftProperty.key, leftProperty.value);

	for (let i = leftProperty.occurrences.length - 1; i >= 0; i--) {
		const occurrence = leftProperty.occurrences[i];

		// Check if the occurrence is to the right of the split.
		if (occurrence > splitIndex) {
			leftProperty.occurrences.pop();
			rightProperty.occurrences.unshift(occurrence);
		} else {
			// Once an occurrence is found to the left of the split, the rest of the occurrences will also be to the left.
			break;
		}
	}

	nodes.splice(leftProperty.end.index, 1, rightProperty.end);
	nodes.splice(splitIndex + 1, 0, rightProperty);
	nodes.splice(splitIndex, 0, leftProperty.end);

	// Adjust all property indexes to account for the split.

	const adjustIndex = (index: number) => {
		if (index >= splitIndex) {
			if (index > splitIndex) {
				// Inserting `rightProperty` will shift this to the right.
				index++;
			}

			// Inserting `leftProperty.end` will shift this to the right.
			index++;
		}

		return index;
	};

	adjustPropertyIndexes(properties, adjustIndex);
	splitIndex = adjustIndex(splitIndex);

	rightProperty.index = splitIndex + 1;
	rightProperty.end.index = leftProperty.end.index;
	leftProperty.end.index = splitIndex - 1;

	properties.push(rightProperty);

	return rightProperty;
};

export default splitPropertyRange;