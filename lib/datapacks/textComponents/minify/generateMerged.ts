import type { TextComponentObject } from 'sandstone';
import heritableKeys, { whitespaceAffectedByKeys } from 'lib/datapacks/textComponents/heritableKeys';
import type { FlatJSONTextComponent } from 'lib/datapacks/textComponents/flatten';
import isAffectedByInheriting from 'lib/datapacks/textComponents/minify/isAffectedByInheriting';
import { notWhitespace } from 'lib/datapacks/textComponents/minify/regex';
import getHeritableKeys from 'lib/datapacks/textComponents/getHeritableKeys';

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

		if (typeof subcomponent === 'object') {
			if ('text' in subcomponent) {
				// If this point is reached, the subcomponent's properties necessarily have a distinguishable effect on its `text`.

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

							continue;
						}
					}

					// If this point is reached, either the previous subcomponent doesn't have `text`, or the properties of the subcomponents don't match, so they can't possibly merge.
					yield previousSubcomponent;
					previousSubcomponent = subcomponent;
					continue;
				}

				// If this point is reached, this subcomponent has distinguishable properties, and the previous subcomponent is a plain primitive.

				// Try to merge the previous subcomponent into this one.
				if (isAffectedByInheriting(previousSubcomponent, getHeritableKeys(subcomponent))) {
					yield previousSubcomponent;
				} else {
					subcomponent.text = previousSubcomponent.toString() + subcomponent.text;
				}
				previousSubcomponent = subcomponent;
				continue;
			}

			// If this point is reached, this subcomponent is an object without `text`, so the previous one can't possibly merge with it.
			yield previousSubcomponent;
			previousSubcomponent = subcomponent;
			continue;
		}

		// If this point is reached, the subcomponent is a plain primitive.

		if (typeof previousSubcomponent === 'object') {
			if ('text' in previousSubcomponent) {
				// Check whether this subcomponent can merge into the previous subcomponent (which necessarily has distinguishable formatting, since otherwise it would already have been reduced to a plain primitive).
				if (isAffectedByInheriting(subcomponent, getHeritableKeys(previousSubcomponent))) {
					yield previousSubcomponent;
					previousSubcomponent = subcomponent;
				} else {
					previousSubcomponent.text += subcomponent.toString();
				}
				continue;
			}

			// If this point is reached, the previous subcomponent doesn't have `text`, so it can't possibly merge with this one.
			yield previousSubcomponent;
			previousSubcomponent = subcomponent;
			continue;
		}

		// If this point is reached, the previous subcomponent is a plain primitive, so it can merge with this plain primitive.
		previousSubcomponent = previousSubcomponent.toString() + subcomponent;
	}

	yield previousSubcomponent;
};

export default generateMerged;