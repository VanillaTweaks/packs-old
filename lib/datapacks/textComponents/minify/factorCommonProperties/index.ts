import type { FlatJSONTextComponent } from 'lib/datapacks/textComponents/flatten';
import type { HeritableKey } from 'lib/datapacks/textComponents/heritableKeys';
import isAffectedByInheriting from 'lib/datapacks/textComponents/minify/isAffectedByInheriting';
import getHeritableKeys from 'lib/datapacks/textComponents/getHeritableKeys';

/** A string that both uniquely identifies a property and represents the number of characters which that property generally consumes via its length. */
type PropertyString = `,"${string}":${string}`;

/** Information about a `TextComponentObject` property. */
type PropertyInfo = {
	key: HeritableKey,
	string: PropertyString,
	/** An ordered array of indexes in the `subcomponents` at which the property is present. */
	occurrences: number[],
	/**
	 * An ordered array of adjacent indexes in the `subcomponents` at which inheriting the property has no distinguishable effect.
	 *
	 * Is a superset of `occurrences`. Does not include indexes before the first index in `occurrences`.
	 */
	unaffected: number[]
};

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
	/** An array of information about all the properties from all the subcomponents. */
	const properties: PropertyInfo[] = [];
	/** A mapping from each distinct `PropertyString` to information about that property. */
	const propertyRecord: Partial<Record<PropertyString, PropertyInfo>> = {};

	for (let subcomponentIndex = 0; subcomponentIndex < subcomponents.length; subcomponentIndex++) {
		const subcomponent = subcomponents[subcomponentIndex];

		if (typeof subcomponent !== 'object') {
			continue;
		}

		for (const key of getHeritableKeys(subcomponent)) {
			const value = subcomponent[key];
			const propertyString: PropertyString = `,"${key}":${JSON.stringify(value)}`;

			let property = propertyRecord[propertyString];

			if (!(
				property
				// Ensure this subcomponent is adjacent to this property's last unaffected subcomponent.
				// If it isn't, then create a new `PropertyInfo` object for the next range of unaffected subcomponents.
				&& property.unaffected[property.unaffected.length - 1] === subcomponentIndex - 1
			)) {
				property = {
					key,
					string: propertyString,
					occurrences: [],
					unaffected: []
				};

				propertyRecord[propertyString] = property;
				properties.push(property);
			}

			property.occurrences.push(subcomponentIndex);
			property.unaffected.push(subcomponentIndex);
		}

		for (const property of properties) {
			if (
				// Ensure the previous `for` loop didn't already push `subcomponentIndex` to the `property`'s `unaffected` array.
				property.unaffected[property.unaffected.length - 1] !== subcomponentIndex
				&& !isAffectedByInheriting(subcomponent, [property.key])
			) {
				property.unaffected.push(subcomponentIndex);
			}
		}
	}

	// Sort `properties` by roughly how many total characters each property consumes throughout all subcomponents, from most to least.
	properties.sort((propertyA, propertyB) => {
		const propertyACost = propertyA.string.length * propertyA.occurrences.length;
		const propertyBCost = propertyB.string.length * propertyB.occurrences.length;

		return propertyBCost - propertyACost;
	});

	// TODO

	return subcomponents;
};

export default factorCommonProperties;