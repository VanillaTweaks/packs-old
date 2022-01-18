import type { FlatJSONTextComponent } from 'lib/datapacks/textComponents/flatten';
import { notLineBreaks, notWhitespace } from 'lib/datapacks/textComponents/regex';
import { whitespaceUnaffectedByKeys } from 'lib/datapacks/textComponents/heritableKeys';
import minify from 'lib/datapacks/textComponents/minify';

type SubcomponentPossiblyWithWith = Extract<FlatJSONTextComponent, { with?: any }>;

/**
 * Reduces the size of each `FlatJSONTextComponent` using only the information contained by it.
 *
 * ⚠️ Only for use in `minify`. May mutate the inputted subcomponents.
 */
const generateReduced = function* (
	subcomponentGenerator: Generator<FlatJSONTextComponent, void>
): Generator<FlatJSONTextComponent, void> {
	for (const subcomponent of subcomponentGenerator) {
		if (typeof subcomponent === 'object') {
			if ('text' in subcomponent) {
				if (subcomponent.text === '') {
					// Reduce empty strings to nothing by not yielding anything.
					continue;
				}

				const text = subcomponent.text.toString();
				const textIsWhitespace = !notWhitespace.test(text);

				if (textIsWhitespace) {
					for (const key of whitespaceUnaffectedByKeys) {
						delete subcomponent[key];
					}
				}

				/** Whether the subcomponent's properties have no distinguishable effect on its `text`. */
				const textUnaffectedByProperties = (
					// Check if `text` is the only remaining property of the subcomponent.
					Object.values(subcomponent).length === 1 || (
						textIsWhitespace && !notLineBreaks.test(text)
					)
				);
				if (textUnaffectedByProperties) {
					// Reduce this subcomponent to a plain string.
					yield text;
					continue;
				}
			} else if ((subcomponent as SubcomponentPossiblyWithWith).with) {
				// Recursively minify `with` values.
				(subcomponent as SubcomponentPossiblyWithWith).with = (
					// TODO: Remove `as any`.
					(subcomponent as SubcomponentPossiblyWithWith).with!.map(minify) as any
				);
			}
		}

		// The reason we don't have to avoid yielding `''` here is because `generateFlat`, the first step of the `minify` algorithm, never yields `''`, so `subcomponent` here in this later step could never be `''`.

		yield subcomponent;
	}
};

export default generateReduced;