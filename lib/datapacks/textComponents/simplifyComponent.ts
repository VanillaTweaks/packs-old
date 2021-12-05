import type { JSONTextComponent } from 'sandstone';

const specialFormattingKeys = [
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

const hasNoSpecialFormatting = (component: JSONTextComponent): boolean => {
	if (typeof component === 'object') {
		if ('text' in component) {
			for (const key of specialFormattingKeys) {
				if (key in component) {
					return false;
				}
			}
			return true;
		}
		return false;
	}
	return true;
};

const lineBreaks = /^\n*$/;
const whitespace = /^\s*$/;

/** Checks whether the `source` JSON text component can be merged into the `target` JSON text component, given neither are arrays. */
const canMergeComponents = (source: JSONTextComponent, target: JSONTextComponent, toLeft = false): boolean => {
	if (source instanceof Array || target instanceof Array || typeof target === 'number' || typeof target === 'boolean') {
		return false;
	}

	if (typeof source === 'string' && typeof target === 'string') {
		return true;
	}

	if (typeof source === 'object') {
		if (
			'text' in source
			&& !('extra' in source)
			&& typeof target === 'object'
			&& 'text' in target
			&& !('extra' in target && toLeft)
		) {
			if (!lineBreaks.test(source.text.toString())) {
				const keysWhichMustMatch: Array<keyof typeof source> = [...specialFormattingKeys];

				if (!whitespace.test(source.text.toString())) {
					keysWhichMustMatch.push('color');
				}

				for (const key of keysWhichMustMatch) {
					if (source[key] !== target[key]) {
						return false;
					}
				}
			}

			// If this point is reached, either the source text is line breaks or all necessary keys match.
			return true;
		}

		return false;
	}

	// If this point is reached, the source is primitive.
	return typeof target === 'object' && 'text' in target && (
		lineBreaks.test(source.toString()) || (
			hasNoSpecialFormatting(target) && (
				!target.color || whitespace.test(source.toString())
			)
		)
	);
};

/** Concatenates line breaks and spaces into their siblings, spreads unnecessary arrays, and merges sibling components which have equivalent properties. */
export default function simplifyComponent(component: JSONTextComponent, options?: {
	mustReturnArray?: false,
	modifiedCallback?: () => void
}): JSONTextComponent;

export default function simplifyComponent(component: JSONTextComponent, options: {
	mustReturnArray: true,
	modifiedCallback?: () => void
}): JSONTextComponent[];

// This ESLint comment is necessary because the rule wants me to use an arrow function, which does not allow for the overloading used here.
// eslint-disable-next-line func-style
export default function simplifyComponent(component: JSONTextComponent, options: {
	mustReturnArray?: boolean,
	modifiedCallback?: () => void
} = {}): JSONTextComponent {
	let modified = false;

	if (component instanceof Array) {
		for (let i = 0; i < component.length; i++) {
			if (i < 0) {
				continue;
			}

			const item = component[i];

			if (item instanceof Array) {
				component.splice(i, 1, ...item);

				modified = true;
				i -= 2;
			} else if (typeof item === 'number' || typeof item === 'boolean') {
				component[i] = item.toString();

				modified = true;
				i -= 2;
			} else {
				const nextItem = component[i + 1];
				if (
					i + 1 < component.length
					&& !(
						i === 0
						&& typeof nextItem === 'object'
						&& typeof item === 'string'
						&& whitespace.test(item)
						&& !canMergeComponents('any non-whitespace text', nextItem)
					)
					&& canMergeComponents(item, nextItem)
				) {
					component.splice(
						i,
						2,
						typeof nextItem === 'string'
							? item + nextItem
							: {
								...nextItem as any,
								text: (typeof item === 'object' ? (item as any).text : item) + (nextItem as any).text
							}
					);

					modified = true;
					i -= 2;
				} else {
					const previousItem = component[i - 1];
					if (i - 1 >= 0 && canMergeComponents(item, previousItem, true)) {
						component.splice(i - 1, 2, typeof previousItem === 'string' ? previousItem + item : {
							...previousItem as any,
							text: (previousItem as any).text + (typeof item === 'object' ? (item as any).text : item)
						});

						modified = true;
						i -= 3;
					} else {
						component[i] = simplifyComponent(item, {
							modifiedCallback: () => {
								modified = true;
								i -= 2;
							}
						});
					}
				}
			}
		}

		if (!options.mustReturnArray && component.length === 1) {
			component = component[0];

			modified = true;
		}
	} else if (typeof component === 'object') {
		if ('with' in component && component.with) {
			for (const item of component.with) {
				simplifyComponent(item);
			}
		}

		if ('extra' in component && component.extra) {
			component.extra = simplifyComponent(component.extra, {
				mustReturnArray: true,
				modifiedCallback: () => {
					modified = true;
				}
			})!;
		}

		const keys = Object.keys(component);
		if (keys.length === 1 && keys[0] === 'text') {
			component = (component as { text: string }).text;

			modified = true;
		}
	}

	if (modified && options.modifiedCallback) {
		options.modifiedCallback();
	}

	return component;
}