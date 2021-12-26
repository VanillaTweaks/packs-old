import type { JSONTextComponent } from 'sandstone';
import hasSpecialFormatting, { specialFormattingKeys } from 'lib/datapacks/textComponents/hasSpecialFormatting';
import { ComponentClass } from 'sandstone/variables';

const lineBreaks = /^\n*$/;
const whitespace = /^\s*$/;

/** Checks whether the `source` JSON text component can be merged into the `target` JSON text component without changing their appearance, given neither are arrays. */
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
			!hasSpecialFormatting(target) && (
				!target.color || whitespace.test(source.toString())
			)
		)
	);
};

/** Concatenates line breaks and spaces into their siblings, spreads unnecessary arrays, and merges sibling components which have equivalent properties. */
export default function minify(component: JSONTextComponent, options?: {
	mustReturnArray?: false,
	modifiedCallback?: () => void
}): JSONTextComponent;

export default function minify(component: JSONTextComponent, options: {
	mustReturnArray: true,
	modifiedCallback?: () => void
}): JSONTextComponent[];

export default function minify(component: JSONTextComponent, options: {
	mustReturnArray?: boolean,
	modifiedCallback?: () => void
} = {}): JSONTextComponent {
	let modified = false;

	if (component instanceof Array) {
		component = [...component];

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
						component[i] = minify(item, {
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
		if (component instanceof ComponentClass) {
			throw new TypeError('TODO: Figure out why `ComponentClass` is necessary to check for. Consider making a new type that excludes it from `JSONTextComponent` and using that everywhere instead.');
		}

		component = { ...component };

		if ('with' in component && component.with) {
			component.with = minify(component.with, {
				mustReturnArray: true,
				modifiedCallback: () => {
					modified = true;
				}
			// TODO: Remove ` as any`.
			}) as any;
		}

		if ('extra' in component && component.extra) {
			component.extra = minify(component.extra, {
				mustReturnArray: true,
				modifiedCallback: () => {
					modified = true;
				}
			});
		} else if ('text' in component && component.text === '') {
			// This transformation is invalid if `component` has special formatting and is the first element of an array with at least one non-empty element.
			// That's probably not worth fixing since we always avoid putting special formatting on the first element of an array.

			component = '';

			modified = true;
		}

		if (component !== '') {
			const keys = Object.keys(component);
			if (keys.length === 1 && keys[0] === 'text') {
				component = (component as { text: string }).text;

				modified = true;
			}
		}
	}

	if (modified && options.modifiedCallback) {
		options.modifiedCallback();
	}

	return component;
}