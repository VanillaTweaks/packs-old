import type { FlatJSONTextComponent } from 'lib/datapacks/textComponents/flatten';
import isAffectedByInheriting from 'lib/datapacks/textComponents/minify/isAffectedByInheriting';
import getHeritableKeys from 'lib/datapacks/textComponents/getHeritableKeys';
import type PropertyBoundary from 'lib/datapacks/textComponents/minify/factorCommonProperties/PropertyBoundary';
import PropertyStart from 'lib/datapacks/textComponents/minify/factorCommonProperties/PropertyStart';
import type { PropertyString } from 'lib/datapacks/textComponents/minify/factorCommonProperties/getPropertyString';
import getPropertyString from 'lib/datapacks/textComponents/minify/factorCommonProperties/getPropertyString';
import PropertyEnd from 'lib/datapacks/textComponents/minify/factorCommonProperties/PropertyEnd';

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
	/** All subcomponents with `PropertyBoundary`s mixed in to mark where properties start and end within the subcomponents. */
	const nodes: Array<FlatJSONTextComponent | PropertyBoundary> = [];
	const properties: PropertyStart[] = [];
	/** An mapping from each `PropertyString` to its `PropertyStart` if it has no respective `PropertyEnd` yet. */
	const openProperties: Record<PropertyString, PropertyStart> = {};

	/** Marks the end of a range of subcomponents which are unaffected by the specified property, and removes the specified property from `openProperties`. */
	const endProperty = (property: PropertyStart) => {
		nodes.push(new PropertyEnd(property));

		delete openProperties[property.string];
	};

	for (let subcomponentIndex = 0; subcomponentIndex < subcomponents.length; subcomponentIndex++) {
		const subcomponent = subcomponents[subcomponentIndex];

		if (typeof subcomponent === 'object') {
			for (const key of getHeritableKeys(subcomponent)) {
				const value = subcomponent[key];
				const propertyString = getPropertyString(key, value);

				let property = openProperties[propertyString] as PropertyStart | undefined;

				if (!property) {
					property = new PropertyStart(key, value);

					nodes.push(property);
					properties.push(property);
					openProperties[propertyString] = property;
				}

				property.occurrences.push(subcomponentIndex);
			}
		}

		for (const property of Object.values(openProperties)) {
			if (
				// We don't need to check whether the subcomponent is affected by the property if we already know it has the property.
				property.occurrences[property.occurrences.length - 1] !== subcomponentIndex
				&& isAffectedByInheriting(subcomponent, [property.key])
			) {
				endProperty(property);
			}
		}

		nodes.push(subcomponent);
	}

	for (const property of Object.values(openProperties)) {
		endProperty(property);
	}



	return subcomponents;
};

export default factorCommonProperties;