import type { TextComponentObject } from 'sandstone';
import heritableKeys, { whitespaceAffectedByKeys } from 'lib/datapacks/textComponents/heritableKeys';
import type { FlatJSONTextComponent } from 'lib/datapacks/textComponents/flatten';
import isAffectedByInheritingFrom from 'lib/datapacks/textComponents/minify/isAffectedByInheritingFrom';
import { notWhitespace } from 'lib/datapacks/textComponents/minify/regex';

type TextComponentObjectWithText = Extract<TextComponentObject, { text: any }>;

/**
 * Merges adjacent elements of the inputted `JSONTextComponent` array wherever possible.
 *
 * ⚠️ Only for use in `minify`. May mutate the inputted subcomponents.
 */
const generateMerged = function* (
	subcomponentGenerator: Generator<FlatJSONTextComponent, void>
): Generator<FlatJSONTextComponent, void> {
	const firstSubcomponentResult = subcomponentGenerator.next();
	if (firstSubcomponentResult.done) {
		return;
	}

	let previousSubcomponent = firstSubcomponentResult.value;

	for (const subcomponent of subcomponentGenerator) {
		// Try to merge this subcomponent with the previous one.

		/** Whether this subcomponent was successfully merged with the previous one. */
		let merged = false;

		if (typeof subcomponent === 'object') {
			if ('text' in subcomponent) {
				// If this point is reached, the subcomponent has `text` with distinguishable properties.

				if (typeof previousSubcomponent === 'object') {
					if ('text' in previousSubcomponent) {
						// If this point is reached, both this subcomponent and the previous one have `text` with distinguishable properties.

						const text = subcomponent.text.toString();
						const textIsWhitespace = !notWhitespace.test(text);

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
							merged = true;
						}
					}
				} else if (!isAffectedByInheritingFrom(previousSubcomponent, subcomponent)) {
					// If this point is reached, this subcomponent has `text` with distinguishable properties, the previous subcomponent is a plain primitive, and they can be merged.
					subcomponent.text = previousSubcomponent.toString() + subcomponent.text;
					previousSubcomponent = subcomponent;
					merged = true;
				}
			}
		} else if (typeof previousSubcomponent === 'object') {
			// If this point is reached, this subcomponent is a plain primitive, but the previous one is not.

			if (
				'text' in previousSubcomponent
				&& !isAffectedByInheritingFrom(subcomponent, previousSubcomponent)
			) {
				previousSubcomponent.text += subcomponent.toString();
				merged = true;
			}
		} else {
			// If this point is reached, both this subcomponent and the previous one are plain primitives.
			previousSubcomponent = previousSubcomponent.toString() + subcomponent;
			merged = true;
		}

		if (!merged) {
			// The previous subcomponent is ready to be yielded, since it is now known not to be mergeable with this subcomponent.
			yield previousSubcomponent;
			previousSubcomponent = subcomponent;
		}
	}

	yield previousSubcomponent;
};

export default generateMerged;