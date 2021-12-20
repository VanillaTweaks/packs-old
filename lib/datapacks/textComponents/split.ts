import type { JSONTextComponent } from 'sandstone';

/**
 * Splits a `JSONTextComponent` into an array of multiple `JSONTextComponent`s (not minified).
 *
 * Assumes all arrays in the inputted component have elements which shouldn't inherit special formatting from the first element, so it isn't necessary to avoid special formatting on the first element of any inputted array.
 *
 * The returned array is never empty.
 */
const split = (
	/** The text component to split. */
	component: JSONTextComponent,
	/** The string on which each split should occur. */
	separator: string
): JSONTextComponent[] => {
	if (typeof component === 'string') {
		return component.split(separator);
	}

	if (Array.isArray(component)) {
		if (component.length === 0) {
			return [component];
		}

		const splitComponent: JSONTextComponent[] = split(component[0], separator);

		for (let i = 1; i < component.length; i++) {
			const splitSubComponent = split(component[i], separator);

			// Concatenate the first element of the split sub-component onto the last element of the split component.
			const lastSplitComponentIndex = splitComponent.length - 1;
			splitComponent[lastSplitComponentIndex] = [
				'',
				splitComponent[lastSplitComponentIndex],
				splitSubComponent[0]
			];

			// Push the rest of the split sub-component's elements separately.
			splitComponent.push(...splitSubComponent.slice(1));
		}

		return splitComponent;
	}

	if (typeof component === 'number' || typeof component === 'boolean') {
		return split(component.toString(), separator);
	}

	if ('extra' in component) {
		throw new TypeError('The `extra` property is not supported when splitting text components.');
	}

	if ('text' in component) {
		return component.text.toString().split(separator).map(substring => ({
			...component,
			text: substring
		}));
	}

	return [component];
};

export default split;