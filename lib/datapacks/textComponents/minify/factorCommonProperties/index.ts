import type { FlatJSONTextComponent } from 'lib/datapacks/textComponents/flatten';
import isAffectedByInheriting from 'lib/datapacks/textComponents/minify/isAffectedByInheriting';
import getHeritableKeys from 'lib/datapacks/textComponents/getHeritableKeys';
import type PropertyBoundary from 'lib/datapacks/textComponents/minify/factorCommonProperties/PropertyBoundary';
import PropertyStart from 'lib/datapacks/textComponents/minify/factorCommonProperties/PropertyStart';
import type { PropertyString } from 'lib/datapacks/textComponents/minify/factorCommonProperties/getPropertyString';
import getPropertyString from 'lib/datapacks/textComponents/minify/factorCommonProperties/getPropertyString';

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
	/** All subcomponents with `PropertyBoundary`s mixed in to mark where properties start and end within the subcomponents (ordered). */
	const nodes: Array<FlatJSONTextComponent | PropertyBoundary> = [];
	/** The `PropertyStart`s of all property ranges that are not yet finalized. */
	const tentativeProperties = new Set<PropertyStart>();

	/** Pushes a `PropertyBoundary` to `nodes`, setting its `index`. */
	const pushPropertyNode = (propertyBoundary: PropertyBoundary) => {
		propertyBoundary.index = nodes.length;
		nodes.push(propertyBoundary);
	};

	/** An mapping from each `PropertyString` to its `PropertyStart` if it has no respective `PropertyEnd` yet. */
	const openProperties: Record<PropertyString, PropertyStart> = {};

	/** Marks the end of a range of subcomponents which are unaffected by the specified property, and removes the specified property from `openProperties`. */
	const endProperty = (property: PropertyStart) => {
		pushPropertyNode(property.end);

		delete openProperties[property.string];
	};

	for (const subcomponent of subcomponents) {
		// End any open properties that would affect this subcomponent.
		for (const property of Object.values(openProperties)) {
			if (isAffectedByInheriting(subcomponent, [property.key])) {
				endProperty(property);
			}
		}

		if (typeof subcomponent === 'object') {
			// Start or continue properties which this subcomponent has.

			const newProperties: PropertyStart[] = [];

			for (const key of getHeritableKeys(subcomponent)) {
				const value = subcomponent[key];
				const propertyString = getPropertyString(key, value);

				let property = openProperties[propertyString] as PropertyStart | undefined;

				if (!property) {
					property = new PropertyStart(key, value);
					newProperties.push(property);

					pushPropertyNode(property);
					tentativeProperties.add(property);
					openProperties[propertyString] = property;
				}
			}

			for (const property of newProperties) {
				property.occurrences.push(nodes.length);
			}
		}

		nodes.push(subcomponent);
	}

	Object.values(openProperties).forEach(endProperty);

	// `nodes` and `tentativeProperties` are now compiled.

	/**
	 * Ends the specified property range before the specified index and starts it again after that index.
	 *
	 * ⚠️ Assumes the specified index is inside the range of the specified property.
	 */
	const splitProperty = (
		/** The `PropertyStart` of the property to split. */
		property: PropertyStart,
		/** The index in `nodes` to split the property around. */
		splitIndex: number
	) => {

	};

	// Split properties that straddle the boundaries of more costly properties.
	while (tentativeProperties.size) {
		const tentativePropertyIterator = tentativeProperties.values();

		/** The most costly element of `tentativeProperties`. */
		let greatestProperty = tentativePropertyIterator.next().value;

		for (const property of tentativePropertyIterator) {
			if (property.cost > greatestProperty.cost) {
				greatestProperty = property;
			}
		}

		/** The `PropertyStart` of each property which straddles the `greatestProperty`'s start boundary. */
		const startStraddlers: PropertyStart[] = [];
		/** The `PropertyStart` of each property which straddles the `greatestProperty`'s end boundary. */
		const endStraddlers: PropertyStart[] = [];

		for (const property of tentativeProperties) {
			if (property.index < greatestProperty.index) {
				if (
					property.end.index > greatestProperty.index
					&& property.end.index < greatestProperty.end.index
				) {
					startStraddlers.push(property);
				}
			} else if (property.end.index > greatestProperty.end.index) {
				endStraddlers.push(property);
			}
		}

		for (const property of startStraddlers) {
			splitProperty(property, greatestProperty.index);
		}

		for (const property of endStraddlers) {
			splitProperty(property, greatestProperty.end.index);
		}

		// The `greatestProperty` is no longer tentative.
		tentativeProperties.delete(greatestProperty);
	}

	return subcomponents;
};

export default factorCommonProperties;