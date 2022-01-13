import type { JSONTextComponent, TextComponentObject } from 'sandstone';
import getHeritableProperties from 'lib/datapacks/textComponents/getHeritableProperties';
import type { HeritableKey } from 'lib/datapacks/textComponents/heritableKeys';
import heritableKeys, { whitespaceAffectedByKeys, whitespaceUnaffectedByKeys } from 'lib/datapacks/textComponents/heritableKeys';
import { generateFlat } from 'lib/datapacks/textComponents/flatten';
import whitespaceUnaffectedBy from 'lib/datapacks/textComponents/whitespaceUnaffectedBy';

type TextComponentObjectWithText = Extract<TextComponentObject, { text: any }>;

const notLineBreaks = /[^\n]/;
const notWhitespace = /[^\s]/;

/** Transforms a `JSONTextComponent` to be as short and simplified as possible while keeping it indistinguishable in-game. */
const minify = (component: JSONTextComponent) => {
	const output: Array<TextComponentObject | string> = [];

	let previousSubcomponent: TextComponentObject | string | undefined;

	const pushPreviousSubcomponent = () => {
		if (previousSubcomponent !== undefined) {
			output.push(previousSubcomponent);
		}
	};

	/** Finalizes the `previousSubcomponent` by pushing it to the `output`, since it can't be merged with the next `subcomponent` specified in this function's argument. */
	const startNewSubcomponent = (subcomponent: typeof previousSubcomponent) => {
		pushPreviousSubcomponent();
		previousSubcomponent = subcomponent;
	};

	const processPlainString = (
		subcomponent: string,
		subcomponentIsWhitespace?: boolean,
		subcomponentIsLineBreaks?: boolean
	) => {
		// Try to merge this subcomponent into the previous one.

		if (previousSubcomponent === undefined) {
			previousSubcomponent = subcomponent;
			return;
		}

		if (typeof previousSubcomponent === 'object') {
			if ('text' in previousSubcomponent) {
				if (subcomponentIsWhitespace === undefined) {
					subcomponentIsWhitespace = !notWhitespace.test(subcomponent);
				}
				if (subcomponentIsLineBreaks === undefined) {
					subcomponentIsLineBreaks = subcomponentIsWhitespace && !notLineBreaks.test(subcomponent);
				}

				// Check whether this subcomponent can merge into the previous subcomponent (which necessarily has distinguishable formatting, since otherwise it would already have been reduced to a plain string).
				if (subcomponentIsLineBreaks || (
					subcomponentIsWhitespace
					&& whitespaceUnaffectedBy(previousSubcomponent)
				)) {
					previousSubcomponent.text += subcomponent;
				} else {
					startNewSubcomponent(subcomponent);
				}
				return;
			}

			// If this point is reached, the previous subcomponent doesn't have `text`, so it can't possibly merge with this one.
			startNewSubcomponent(subcomponent);
			return;
		}

		// If this point is reached, `previousSubcomponent` is a plain string, so it can merge with this plain string.
		previousSubcomponent += subcomponent;
	};

	for (const subcomponent of generateFlat(component)) {
		// Try to reduce this subcomponent and merge it with the previous one.

		if (typeof subcomponent === 'object') {
			if ('text' in subcomponent) {
				if (subcomponent.text === '') {
					continue;
				}

				const text = subcomponent.text.toString();
				const textIsWhitespace = !notWhitespace.test(text);
				let textIsLineBreaks;

				if (textIsWhitespace) {
					for (const key of whitespaceUnaffectedByKeys) {
						delete subcomponent[key];
					}
				}

				const subcomponentKeys = Object.keys(subcomponent);
				/** Whether the subcomponent's properties have no distinguishable effect on its `text`. */
				const textUnaffectedByProperties = (
					// Check if `text` is the only remaining property of the subcomponent.
					subcomponentKeys.length === 1 || (
						textIsLineBreaks = textIsWhitespace && !notLineBreaks.test(text)
					)
				);
				if (textUnaffectedByProperties) {
					// Reduce this subcomponent to a plain string.
					processPlainString(text, textIsWhitespace, textIsLineBreaks);
					continue;
				}

				// If this point is reached, the subcomponent's properties necessarily have a distinguishable effect on its `text`.

				if (previousSubcomponent === undefined) {
					previousSubcomponent = subcomponent;
					continue;
				}

				if (typeof previousSubcomponent === 'object') {
					if ('text' in previousSubcomponent) {
						// If this point is reached, both this subcomponent and the previous one have `text` with distinguishable properties.

						const keysWhichMustEqual = (
							textIsWhitespace
							|| !notWhitespace.test(previousSubcomponent.text.toString())
								? whitespaceAffectedByKeys
								: heritableKeys
						);
						if (keysWhichMustEqual.every(key => (
							subcomponent[key]
							=== (previousSubcomponent as TextComponentObjectWithText)[key]
						))) {
							// Merge their `text`.

							// Save the `previousSubcomponent.text` before potentially overwriting the `previousSubcomponent`.
							const previousText = previousSubcomponent.text;

							if (!textIsWhitespace) {
								// If this subcomponent isn't only whitespace, it is more likely to have distinguishable properties which the previous component doesn't have (since it's possible that the previous component is only whitespace), so the previous component's `text` should be merged into this subcomponent rather than the other way around.
								previousSubcomponent = subcomponent;
							}

							previousSubcomponent.text = previousText + text;

							continue;
						}
					}

					// If this point is reached, either the previous subcomponent doesn't have `text`, or the properties of the subcomponents don't match, so they can't possibly merge.
					startNewSubcomponent(subcomponent);
					continue;
				}

				// If this point is reached, this subcomponent has distinguishable properties, and the previous subcomponent is a plain string.
				// Try to merge the previous subcomponent into this one.

				if (!notWhitespace.test(previousSubcomponent) && (
					whitespaceUnaffectedBy(subcomponent)
					|| !notLineBreaks.test(previousSubcomponent)
				)) {
					subcomponent.text = previousSubcomponent + text;
					previousSubcomponent = subcomponent;
				} else {
					startNewSubcomponent(subcomponent);
				}
				continue;
			}

			// If this point is reached, this subcomponent doesn't have `text`.

			if ('with' in subcomponent && subcomponent.with !== undefined) {
				// TODO: Remove `as any`.
				subcomponent.with = subcomponent.with.map(minify) as any;
			}

			// This subcomponent doesn't have `text`, so the previous one can't possibly merge with it.
			startNewSubcomponent(subcomponent);
			continue;
		}

		processPlainString(subcomponent.toString());
	}

	pushPreviousSubcomponent();

	// Check if other subcomponents would inherit unwanted properties from the first subcomponent.
	if (output.length > 1) {
		const heritableProperties = getHeritableProperties(output[0]);
		if (heritableProperties) {
			/** Whether the first subcomponent has heritable properties which affect whitespace. */
			let heritablePropertiesAffectWhitespace: boolean | undefined;

			/** Returns whether a specified string is affected by the heritable properties of the first subcomponent, or `undefined` if it depends on what formatting the string has. */
			const isStringAffected = (string: string) => {
				if (string === '') {
					return false;
				}

				if (!notWhitespace.test(string)) {
					if (!notLineBreaks.test(string)) {
						return false;
					}

					if (heritablePropertiesAffectWhitespace === undefined) {
						heritablePropertiesAffectWhitespace = !whitespaceUnaffectedBy(heritableProperties);
					}

					if (heritablePropertiesAffectWhitespace) {
						return true;
					}
				}
			};

			/** Pushes an empty string to the start of the output to prevent other subcomponents from inheriting properties of the first subcomponent. */
			const preventInheritance = () => {
				output.unshift('');
			};

			let heritablePropertyKeys;

			checkingSubcomponents:
			for (let i = 1; i < output.length; i++) {
				const subcomponent = output[i];

				if (typeof subcomponent === 'string') {
					if (isStringAffected(subcomponent) === false) {
						continue;
					}

					preventInheritance();
					break;
				}

				if ('text' in subcomponent) {
					const stringAffected = isStringAffected(subcomponent.text.toString());

					if (stringAffected) {
						preventInheritance();
						break;
					}

					if (stringAffected === false) {
						continue;
					}
				}

				if (heritablePropertyKeys === undefined) {
					heritablePropertyKeys = Object.keys(heritableProperties) as HeritableKey[];
				}

				for (const heritablePropertyKey of heritablePropertyKeys) {
					if (subcomponent[heritablePropertyKey] === undefined) {
						// A heritable property of the first subcomponent is missing from this subcomponent, so this subcomponent would inherit it.

						preventInheritance();
						break checkingSubcomponents;
					}
				}
			}
		}
	}

	return (
		output.length === 0
			? ''
			: output.length === 1
				? output[0]
				: output
	);
};

export default minify;