import type { FlatJSONTextComponent } from 'lib/datapacks/textComponents/flatten';
import type PropertyBoundary from 'lib/datapacks/textComponents/minify/factorCommonProperties/PropertyBoundary';
import type PropertyStart from 'lib/datapacks/textComponents/minify/factorCommonProperties/PropertyStart';
import removePropertyRange from 'lib/datapacks/textComponents/minify/factorCommonProperties/removePropertyRange';

/** Removes any property ranges with at most 1 occurrence, since they are useless to factor. */
const removeUselessPropertyRanges = (
	nodes: Array<FlatJSONTextComponent | PropertyBoundary>,
	properties: PropertyStart[]
) => {
	for (const property of properties) {
		if (property.occurrences.length <= 1) {
			removePropertyRange(nodes, properties, property);
		}
	}
};

export default removeUselessPropertyRanges;