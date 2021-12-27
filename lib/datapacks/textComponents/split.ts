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
	/** The pattern on which each split should occur. */
	separator: string | RegExp
): JSONTextComponent[] => {
	if (typeof component === 'string') {
		const splitString = component.split(separator);

		// Ensure we never return an empty array.
		if (splitString.length === 0) {
			splitString.push('');
		}

		return splitString;
	}

	if (Array.isArray(component)) {
		if (component.length === 0) {
			return [component];
		}

		const outputComponents: JSONTextComponent[] = split(component[0], separator);

		for (let i = 1; i < component.length; i++) {
			const splitSubComponent = split(component[i], separator);

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