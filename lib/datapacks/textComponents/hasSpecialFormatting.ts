import type { JSONTextComponent } from 'sandstone';

/** `JSONTextComponent` keys which imply there is special formatting. */
export const specialFormattingKeys = [
	'font',
	'bold',
	'italic',
	'underlined',
	'strikethrough',
	'obfuscated',
	'insertion',
	'hoverEvent',
	'clickEvent'
] as const;

/** Checks if a text component has any inheritable special formatting. */
const hasSpecialFormatting = (component: JSONTextComponent): boolean => {
	if (Array.isArray(component)) {
		return hasSpecialFormatting(component[0]);
	}

	if (typeof component === 'object') {
		if ('text' in component) {
			for (const key of specialFormattingKeys) {
				if (key in component) {
					return true;
				}
			}

			return false;
		}

		return true;
	}

	return false;
};

export default hasSpecialFormatting;