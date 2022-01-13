import type { JSONTextComponent, TextComponentObject } from 'sandstone';
import type { MinifyOutputArray } from 'lib/datapacks/textComponents/minify';
import heritableKeys, { whitespaceAffectedByKeys } from 'lib/datapacks/textComponents/heritableKeys';
import type { FlatJSONTextComponent } from 'lib/datapacks/textComponents/flatten';
import { generateFlat } from 'lib/datapacks/textComponents/flatten';
import whitespaceUnaffectedBy from 'lib/datapacks/textComponents/whitespaceUnaffectedBy';
import minify from 'lib/datapacks/textComponents/minify';
import { notWhitespace, notLineBreaks } from 'lib/datapacks/textComponents/minify/regex';
import reduceFlatComponent from 'lib/datapacks/textComponents/minify/reduceFlatComponent';

type TextComponentObjectWithText = Extract<TextComponentObject, { text: any }>;

/**
 * Flattens the inputted component into one array and merges adjacent elements of the array wherever possible.
 *
 * ⚠️ Only for use in `minify`. Mutates the inputted `output` array.
 */
const flattenAndMerge = (component: JSONTextComponent, output: MinifyOutputArray) => {
	let previousSubcomponent: FlatJSONTextComponent | undefined;

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

	for (const nonReducedSubcomponent of generateFlat(component)) {
		const subcomponent = reduceFlatComponent(nonReducedSubcomponent);

		if (subcomponent === '') {
			continue;
		}

		// Try to merge this subcomponent with the previous one.

		if (previousSubcomponent === undefined) {
			previousSubcomponent = subcomponent;
			continue;
		}

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
					startNewSubcomponent(subcomponent);
					continue;
				}

				// If this point is reached, this subcomponent has distinguishable properties, and the previous subcomponent is a plain primitive.
				// Try to merge the previous subcomponent into this one.

				const previousSubcomponentString = previousSubcomponent.toString();
				if (!notWhitespace.test(previousSubcomponentString) && (
					whitespaceUnaffectedBy(subcomponent)
					|| !notLineBreaks.test(previousSubcomponentString)
				)) {
					subcomponent.text = previousSubcomponentString + subcomponent.text;
					previousSubcomponent = subcomponent;
				} else {
					startNewSubcomponent(subcomponent);
				}
				continue;
			}

			// If this point is reached, this subcomponent is an object without `text`.

			// Recursively minify `with` values, just because it needs to be done somewhere, and there isn't really a better place to do it elsewhere.
			type SubcomponentPossiblyWithWith = Extract<typeof subcomponent, { with?: any }>;
			if ((subcomponent as SubcomponentPossiblyWithWith).with) {
				(subcomponent as SubcomponentPossiblyWithWith).with = (
					// TODO: Remove `as any`.
					(subcomponent as SubcomponentPossiblyWithWith).with!.map(minify) as any
				);
			}

			// This subcomponent doesn't have `text`, so the previous one can't possibly merge with it.
			startNewSubcomponent(subcomponent);
			continue;
		}

		// If this point is reached, the subcomponent is a plain primitive.

		if (typeof previousSubcomponent === 'object') {
			if ('text' in previousSubcomponent) {
				const subcomponentString = subcomponent.toString();
				const subcomponentIsWhitespace = !notWhitespace.test(subcomponentString);
				const subcomponentIsLineBreaks = subcomponentIsWhitespace && !notLineBreaks.test(subcomponentString);

				// Check whether this subcomponent can merge into the previous subcomponent (which necessarily has distinguishable formatting, since otherwise it would already have been reduced to a plain primitive).
				if (subcomponentIsLineBreaks || (
					subcomponentIsWhitespace
					&& whitespaceUnaffectedBy(previousSubcomponent)
				)) {
					previousSubcomponent.text += subcomponentString;
				} else {
					startNewSubcomponent(subcomponent);
				}
				continue;
			}

			// If this point is reached, the previous subcomponent doesn't have `text`, so it can't possibly merge with this one.
			startNewSubcomponent(subcomponent);
			continue;
		}

		// If this point is reached, the previous subcomponent is a plain primitive, so it can merge with this plain primitive.
		previousSubcomponent = previousSubcomponent.toString() + subcomponent;
	}

	pushPreviousSubcomponent();
};

export default flattenAndMerge;