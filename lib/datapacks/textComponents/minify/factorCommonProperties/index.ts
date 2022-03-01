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
	/** The `PropertyStart`s of all property ranges that are not yet finalized. */
	const tentativeProperties: PropertyStart[] = [];

	/** An mapping from each `PropertyString` to its `PropertyStart` if it has no respective `PropertyEnd` yet. */
	const openProperties: Record<PropertyString, PropertyStart> = {};

	/** Marks the end of a range of subcomponents which are unaffected by the specified property, and removes the specified property from `openProperties`. */
	const endProperty = (property: PropertyStart) => {
		nodes.push(new PropertyEnd(property));

		delete openProperties[property.string];
	};

	for (let subcomponentIndex = 0; subcomponentIndex < subcomponents.length; subcomponentIndex++) {
		const subcomponent = subcomponents[subcomponentIndex];

		// End any open properties that would affect this subcomponent.
		for (const property of Object.values(openProperties)) {
			if (isAffectedByInheriting(subcomponent, [property.key])) {
				endProperty(property);
			}
		}

		if (typeof subcomponent === 'object') {
			// Start or continue properties which this subcomponent has.
			for (const key of getHeritableKeys(subcomponent)) {
				const value = subcomponent[key];
				const propertyString = getPropertyString(key, value);

				let property = openProperties[propertyString] as PropertyStart | undefined;

				if (!property) {
					property = new PropertyStart(key, value);

					nodes.push(property);
					tentativeProperties.push(property);
					openProperties[propertyString] = property;
				}

				property.occurrences.push(subcomponentIndex);
			}
		}

		nodes.push(subcomponent);
	}

	for (const property of Object.values(openProperties)) {
		endProperty(property);
	}

	// `nodes` and `tentativeProperties` are now compiled.

	// Finalize all `tentativeProperties` in order of cost.
	while (tentativeProperties.length) {
		/** The index of the most costly element of `tentativeProperties`. */
		let greatestPropertyIndex: number;

		let greatestPropertyCost = -1;
		for (let i = 0; i < tentativeProperties.length; i++) {
			const property = tentativeProperties[i];

			if (property.cost > greatestPropertyCost) {
				greatestPropertyIndex = i;
				greatestPropertyCost = property.cost;
			}
		}

		const greatestProperty = tentativeProperties[greatestPropertyIndex!];

		// Split any property ranges that cross the boundaries of the `greatestProperty`.


		// Now that the `greatestProperty` is finalized, it is no longer tentative.
		tentativeProperties.splice(greatestPropertyIndex!, 1)[0];
	}

	return subcomponents;
};

export default factorCommonProperties;