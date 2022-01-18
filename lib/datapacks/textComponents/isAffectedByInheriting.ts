import type { HeritableProperties } from 'lib/datapacks/textComponents/getHeritableProperties';
import type { HeritableKey } from 'lib/datapacks/textComponents/heritableKeys';
import { whitespaceAffectedByKeys } from 'lib/datapacks/textComponents/heritableKeys';
import type { FlatJSONTextComponent } from 'lib/datapacks/textComponents/flatten';
import { notLineBreaks, notWhitespace } from 'lib/datapacks/textComponents/regex';

/** Checks whether a specified `FlatJSONTextComponent` inheriting the specified properties has a distinguishable in-game effect on the component. */
const isAffectedByInheriting = (
	component: FlatJSONTextComponent,
	/**
	 * The properties to check for whether the component is affected by inheriting them, or `undefined` if there are no properties.
	 *
	 * ⚠️ The object passed here must not have additional properties which are not specified by `HeritableProperties`.
	 */
	properties: HeritableProperties | undefined,
	{ textIsWhitespace, textIsLineBreaks }: {
		/**
		 * Whether the component's text is only whitespace.
		 *
		 * If undefined, will be computed automatically if necessary.
		 */
		textIsWhitespace?: boolean,
		/**
		 * Whether the component's text is only line breaks.
		 *
		 * If undefined, will be computed automatically if necessary.
		 */
		textIsLineBreaks?: boolean
	} = {}
) => {
	if (properties === undefined) {
		return false;
	}

	const keys = Object.keys(properties) as HeritableKey[];

	if (keys.length === 0) {
		return false;
	}

	const setText = (text: string) => {
		if (textIsWhitespace === undefined) {
			textIsWhitespace = !notWhitespace.test(text);
		}

		if (textIsLineBreaks === undefined) {
			textIsLineBreaks = textIsWhitespace && !notLineBreaks.test(text);
		}
	};

	if (typeof component === 'object') {
		if ('text' in component) {
			setText(component.text.toString());

			if (textIsLineBreaks) {
				// Nothing affects line breaks.
				return false;
			}
		}

		// Check if a property that affects this component is missing from this component, in which case this component would inherit it.
		return keys.some(
			textIsWhitespace
				? key => (
					component[key] === undefined
					&& (whitespaceAffectedByKeys as readonly string[]).includes(key)
				)
				: key => component[key] === undefined
		);
	}

	// If this point is reached, the component is a plain primitive.

	setText(component.toString());

	if (textIsLineBreaks) {
		// Nothing affects line breaks.
		return false;
	}

	if (textIsWhitespace) {
		// Check if any property affects whitespace.
		return keys.some(
			key => (whitespaceAffectedByKeys as readonly string[]).includes(key)
		);
	}

	// Plain non-whitespace text is affected by any property.
	return true;
};

export default isAffectedByInheriting;