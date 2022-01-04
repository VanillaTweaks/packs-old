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
	/** The pattern on which each split should occur, or a function that takes a string and returns the string split into an array. */
	separatorOrSplitFunction: string | RegExp | (
		(
			/** The string being split. */
			string: string
		) => string[]
	)
): JSONTextComponent[] => {
	if (typeof component === 'string') {
		const splitString = (
			typeof separatorOrSplitFunction === 'function'
				? separatorOrSplitFunction(component)
				: component.split(separatorOrSplitFunction)
		);

		// Ensure we never return an empty array.
		if (splitString.length === 0) {
			splitString.push('');
		}

		return splitString;
	}

	if (Array.isArray(component)) {
		if (component.length === 0) {
			return [[]];
		}

		const outputComponents: JSONTextComponent[] = split(component[0], separatorOrSplitFunction);

		for (let i = 1; i < component.length; i++) {
			const splitSubComponent = split(component[i], separatorOrSplitFunction);

			// Concatenate the first element of the split subcomponent onto the last component of the output.
			const lastOutputComponent = outputComponents[outputComponents.length - 1];
			if (Array.isArray(lastOutputComponent)) {
				if (lastOutputComponent[0] !== '') {
					lastOutputComponent.unshift('');
				}

				lastOutputComponent.push(splitSubComponent[0]);
			} else {
				outputComponents[outputComponents.length - 1] = [
					'',
					lastOutputComponent,
					splitSubComponent[0]
				];
			}

			// Push the rest of the split subcomponent's elements separately.
			outputComponents.push(...splitSubComponent.slice(1));
		}

		return outputComponents;
	}

	if (typeof component === 'number' || typeof component === 'boolean') {
		return split(component.toString(), separatorOrSplitFunction);
	}

	if ('extra' in component) {
		throw new TypeError('The `extra` property is currently not supported when splitting text components.');
	}

	if ('text' in component) {
		return split(component.text, separatorOrSplitFunction).map(substring => ({
			...component,
			// `substring` can be asserted `as string` because `split` always returns a `string[]` for any primitive input.
			text: substring as string
		}));
	}

	return [component];
};

export default split;