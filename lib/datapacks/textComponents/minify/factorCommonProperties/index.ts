import type { FlatJSONTextComponent } from 'lib/datapacks/textComponents/flatten';
import getPropertyRanges from 'lib/datapacks/textComponents/minify/factorCommonProperties/getPropertyRanges';
import splitPropertyRanges from 'lib/datapacks/textComponents/minify/factorCommonProperties/splitPropertyRanges';
import removeUselessPropertyRanges from 'lib/datapacks/textComponents/minify/factorCommonProperties/removeUselessPropertyRanges';
import getFactoredOutput from 'lib/datapacks/textComponents/minify/factorCommonProperties/getFactoredOutput';

/**
 * Wraps certain ranges of subcomponents into arrays, utilizing array inheritance to reduce the number of properties in the wrapped subcomponents.
 *
 * ⚠️ Only for use in `minify`. May mutate the inputted subcomponents.
 *
 * Example:
 *
 * ```
 * minify([
 * 	{ text: 'a', color: 'red' },
 * 	{ text: 'b', color: 'green' },
 * 	{ text: 'c', color: 'blue' },
 * 	{ text: 'd', color: 'green' }
 * ]) === [
 * 	{ text: 'a', color: 'red' },
 * 	[
 * 		{ text: 'b', color: 'green' },
 * 		{ text: 'c', color: 'blue' },
 * 		'd'
 * 	]
 * ]
 * ```
 */
const factorCommonProperties = (subcomponents: FlatJSONTextComponent[]) => {
	const { nodes, properties } = getPropertyRanges(subcomponents);

	splitPropertyRanges(nodes, properties);

	// TODO: Properly handle intersecting (but non-straddling) property ranges with the same key.

	removeUselessPropertyRanges(nodes, properties);

	return getFactoredOutput(nodes);
};

export default factorCommonProperties;