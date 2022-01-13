import type { MinifyOutputArray } from 'lib/datapacks/textComponents/minify';
import { notWhitespace, notLineBreaks } from 'lib/datapacks/textComponents/minify/regex';
import getHeritableProperties from 'lib/datapacks/textComponents/getHeritableProperties';
import type { HeritableKey } from 'lib/datapacks/textComponents/heritableKeys';
import whitespaceUnaffectedBy from 'lib/datapacks/textComponents/whitespaceUnaffectedBy';

/**
 * Inserts `''` at the beginning of the `output` array only if necessary.
 *
 * ⚠️ Only for use in `minify`. Mutates the inputted `output` array.
 */
const disableInheritanceIfNecessary = (output: MinifyOutputArray) => {
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

			for (let i = 1; i < output.length; i++) {
				const subcomponent = output[i];

				if (typeof subcomponent === 'string') {
					if (isStringAffected(subcomponent) === false) {
						continue;
					}

					preventInheritance();
					return;
				}

				if ('text' in subcomponent) {
					const stringAffected = isStringAffected(subcomponent.text.toString());

					if (stringAffected) {
						preventInheritance();
						return;
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
						return;
					}
				}
			}
		}
	}
};

export default disableInheritanceIfNecessary;