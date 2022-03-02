import type { FlatJSONTextComponent } from 'lib/datapacks/textComponents/flatten';
import isAffectedByInheriting from 'lib/datapacks/textComponents/minify/isAffectedByInheriting';
import getHeritableKeys from 'lib/datapacks/textComponents/getHeritableKeys';
import PropertyBoundary from 'lib/datapacks/textComponents/minify/factorCommonProperties/PropertyBoundary';
import PropertyStart from 'lib/datapacks/textComponents/minify/factorCommonProperties/PropertyStart';
import type { PropertyString } from 'lib/datapacks/textComponents/minify/factorCommonProperties/getPropertyString';
import getPropertyString from 'lib/datapacks/textComponents/minify/factorCommonProperties/getPropertyString';
import generateReduced from 'lib/datapacks/textComponents/minify/generateReduced';
import generateMerged from 'lib/datapacks/textComponents/minify/generateMerged';
import type { HeritableKey } from 'lib/datapacks/textComponents/heritableKeys';

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
		for (const property of Object.values(openProperties).reverse()) {
			if (isAffectedByInheriting(subcomponent, [property.key])) {
				endProperty(property);
			}
		}

		if (typeof subcomponent === 'object') {
			// Start or continue properties which this subcomponent has.

			/** Properties which this subcomponent has. */
			const subcomponentProperties: PropertyStart[] = [];

			for (const key of getHeritableKeys(subcomponent)) {
				const value = subcomponent[key];
				const propertyString = getPropertyString(key, value);

				let property = openProperties[propertyString] as PropertyStart | undefined;

				if (!property) {
					property = new PropertyStart(key, value);

					pushPropertyNode(property);
					properties.push(property);
					openProperties[propertyString] = property;
				}

				subcomponentProperties.push(property);
			}

			for (const property of subcomponentProperties) {
				property.occurrences.push(nodes.length);
			}
		}

		nodes.push(subcomponent);
	}

	Object.values(openProperties).reverse().forEach(endProperty);

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
	};

	// Split properties that straddle the boundaries of more costly properties.
	const tentativeProperties = new Set<PropertyStart>(properties);
	while (tentativeProperties.size) {
		const tentativePropertyIterator = tentativeProperties.values();

		/** The most costly element of `tentativeProperties`. */
		let greatestProperty = tentativePropertyIterator.next().value;

		// TODO: Properly handle intersecting (but non-straddling) property ranges with the same key.

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
			} else if (
				property.index < greatestProperty.end.index
				&& property.end.index > greatestProperty.end.index
			) {
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

	// Compile the output from `nodes`.

	type OutputSubcomponent = FlatJSONTextComponent | OutputSubcomponent[];
	let currentArray: OutputSubcomponent[] = [];
	/** The current arrays from ancestor to descendant. */
	const ancestorArrays: OutputSubcomponent[][] = [currentArray];
	/** The current property ranges from ancestor to descendant. */
	const ancestorProperties: PropertyStart[] = [];

	let consecutiveSubcomponents: FlatJSONTextComponent[] | undefined;

	/** Reduces and merges the `consecutiveSubcomponents` and pushes them to the `currentArray`. */
	const endConsecutiveSubcomponents = () => {
		if (consecutiveSubcomponents) {
			let subcomponentGenerator = generateReduced(consecutiveSubcomponents);
			subcomponentGenerator = generateMerged(subcomponentGenerator);

			// Try to merge the first subcomponent into the first element of the `currentArray`.
			if (currentArray.length === 1) {
				const firstTopArrayElement = currentArray[0];
				if (
					typeof firstTopArrayElement === 'object'
					&& 'text' in firstTopArrayElement
					&& firstTopArrayElement.text === ''
				) {
					// `firstSubcomponent` can be asserted as non-void since there has to be at least one element in `consecutiveSubcomponents` in order for `consecutiveSubcomponents` to be set, which `subcomponentGenerator` would yield (albeit possibly transformed).
					const firstSubcomponent = subcomponentGenerator.next().value as FlatJSONTextComponent;
					if (typeof firstSubcomponent === 'object') {
						currentArray.push(firstSubcomponent);
					} else {
						// The `firstSubcomponent` is plain text and would inherit all properties of the `firstTopArrayElement`, so they can be merged.
						firstTopArrayElement.text = firstSubcomponent;
					}
				}
			}

			currentArray.push(...subcomponentGenerator);

			consecutiveSubcomponents = undefined;
		}
	};

	for (const node of nodes) {
		if (node instanceof PropertyBoundary) {
			endConsecutiveSubcomponents();

			if (node instanceof PropertyStart) {
				// TODO: Merge property ranges that start and end at the same place.

				const newTopArray = [{
					text: '',
					[node.key]: node.value
				}];

				currentArray.push(newTopArray);
				ancestorArrays.push(newTopArray);
				ancestorProperties.push(node);

				currentArray = newTopArray;
			} else {
				ancestorArrays.pop();
				ancestorProperties.pop();

				currentArray = ancestorArrays[ancestorArrays.length - 1];
			}
		} else {
			if (consecutiveSubcomponents === undefined) {
				consecutiveSubcomponents = [];
			}

			if (typeof node === 'object') {
				// Remove all properties which this subcomponent inherits from its ancestor arrays.

				const inheritedKeys: Partial<Record<HeritableKey, true>> = {};

				// Iterate through the `ancestorProperties` backward since the last elements are the deepest and would thus have the highest inheritance priority.
				for (let i = ancestorProperties.length - 1; i >= 0; i--) {
					const property = ancestorProperties[i];

					if (inheritedKeys[property.key]) {
						// Don't delete a subcomponent's property if a different value from a higher-priority property with the same key would otherwise affect the subcomponent.
						continue;
					}
					// This property has the highest priority for its key because it's the deepest of the `ancestorProperties` with that key.
					inheritedKeys[property.key] = true;

					if (
						property.key in node
						&& JSON.stringify(node[property.key]) === JSON.stringify(property.value)
					) {
						delete node[property.key];
					}
				}
			}

			consecutiveSubcomponents.push(node);
		}
	}

	endConsecutiveSubcomponents();

	return currentArray;
};

export default factorCommonProperties;