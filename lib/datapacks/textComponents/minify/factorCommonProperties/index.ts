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
	/** The `PropertyStart`s of all property ranges (unordered). */
	const properties: PropertyStart[] = [];
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
				const stringifiedValue = JSON.stringify(subcomponent[key]);
				const propertyString = getPropertyString(key, stringifiedValue);

				let property = openProperties[propertyString] as PropertyStart | undefined;

				if (!property) {
					property = new PropertyStart(key, stringifiedValue);
					newProperties.push(property);

					pushPropertyNode(property);
					properties.push(property);
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

	/** Adjusts the `index`es and `occurrences` of all properties according to the specified function. */
	const adjustIndexes = (
		adjustIndex: (index: number) => number
	) => {
		for (const property of properties) {
			property.index = adjustIndex(property.index);
			property.end.index = adjustIndex(property.end.index);
			for (let i = 0; i < property.occurrences.length; i++) {
				property.occurrences[i] = adjustIndex(property.occurrences[i]);
			}
		}
	};

	/**
	 * Ends the specified property range before the specified index and starts it again after that index.
	 *
	 * ⚠️ Assumes the specified index is inside the range of the specified property.
	 */
	const splitProperty = (
		/** The `PropertyStart` of the property to split. */
		leftProperty: PropertyStart,
		/** The index in `nodes` to split the property around. */
		splitIndex: number
	) => {
		const rightProperty = new PropertyStart(leftProperty.key, leftProperty.stringifiedValue);

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

		// Adjust all indexes to account for the split.

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

		adjustIndexes(adjustIndex);
		splitIndex = adjustIndex(splitIndex);

		rightProperty.index = splitIndex + 1;
		rightProperty.end.index = leftProperty.end.index;
		leftProperty.end.index = splitIndex - 1;

		properties.push(rightProperty);
		tentativeProperties.add(rightProperty);
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

	/** Removes a property's `PropertyBoundary`s from the `nodes` array. */
	const removeProperty = (property: PropertyStart) => {
		nodes.splice(property.end.index, 1);
		nodes.splice(property.index, 1);

		adjustIndexes(index => {
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

	// Remove any property ranges with at most 1 occurrence, since they are useless to factor.
	for (const property of properties) {
		if (property.occurrences.length <= 1) {
			removeProperty(property);
		}
	}

	return subcomponents;
};

export default factorCommonProperties;