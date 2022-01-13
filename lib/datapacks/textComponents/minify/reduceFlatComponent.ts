import type { FlatJSONTextComponent } from 'lib/datapacks/textComponents/flatten';
import { notLineBreaks, notWhitespace } from 'lib/datapacks/textComponents/minify/regex';
import { whitespaceUnaffectedByKeys } from 'lib/datapacks/textComponents/heritableKeys';

/**
 * Reduces the size of a `FlatJSONTextComponent` using only the information contained by it.
 *
 * ⚠️ Only for use in `minify`. May incidentally mutate the inputted component.
 */
const reduceFlatComponent = (component: FlatJSONTextComponent) => {
	if (typeof component === 'object') {
		if ('text' in component) {
			if (component.text === '') {
				return '';
			}

			const text = component.text.toString();
			const textIsWhitespace = !notWhitespace.test(text);

			if (textIsWhitespace) {
				for (const key of whitespaceUnaffectedByKeys) {
					delete component[key];
				}
			}

			/** Whether the component's properties have no distinguishable effect on its `text`. */
			const textUnaffectedByProperties = (
				// Check if `text` is the only remaining property of the component.
				Object.values(component).length === 1 || (
					textIsWhitespace && !notLineBreaks.test(text)
				)
			);
			if (textUnaffectedByProperties) {
				// Reduce this component to a plain string.
				return text;
			}
		}
	}

	return component;
};

export default reduceFlatComponent;