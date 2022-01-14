import { notWhitespace, notLineBreaks } from 'lib/datapacks/textComponents/minify/regex';
import getHeritableProperties from 'lib/datapacks/textComponents/getHeritableProperties';
import type { HeritableKey, WhitespaceAffectedByKey } from 'lib/datapacks/textComponents/heritableKeys';
import { whitespaceAffectedByKeys } from 'lib/datapacks/textComponents/heritableKeys';
import whitespaceUnaffectedBy from 'lib/datapacks/textComponents/whitespaceUnaffectedBy';
import type { FlatJSONTextComponent } from 'lib/datapacks/textComponents/flatten';

/**
 * Returns the `output` array with `''` inserted at the beginning, only if necessary to prevent other subcomponents from inheriting properties from the first.
 *
 * ⚠️ Only for use in `minify`. Assumes `output.length > 1`. May mutate the `output` array.
 */
const disableInheritanceIfNecessary = (output: FlatJSONTextComponent[]) => {
	// Check if other subcomponents would inherit unwanted properties from the first subcomponent.

	/** The first subcomponent's heritable properties. */
	const heritableProperties = getHeritableProperties(output[0]);
	if (heritableProperties) {
		/** The keys of the first subcomponent's heritable properties. */
		let heritablePropertyKeys: HeritableKey[] | undefined;
		/** Resolves and returns the value of `heritablePropertyKeys`. */
		const getHeritablePropertyKeys = () => {
			if (heritablePropertyKeys === undefined) {
				heritablePropertyKeys = Object.keys(heritableProperties) as HeritableKey[];
			}

			return heritablePropertyKeys;
		};

		/** Whether the first subcomponent has heritable properties which affect whitespace. */
		let heritablePropertiesAffectWhitespace: boolean | undefined;

		/** The keys of the first subcomponent's heritable properties which affect whitespace. */
		let heritablePropertyKeysWhichAffectWhitespace: WhitespaceAffectedByKey[] | undefined;
		/** Resolves and returns the value of `heritablePropertyKeysWhichAffectWhitespace`. */
		const getHeritablePropertyKeysWhichAffectWhitespace = () => {
			if (heritablePropertyKeysWhichAffectWhitespace === undefined) {
				heritablePropertyKeysWhichAffectWhitespace = getHeritablePropertyKeys().filter(
					(key): key is WhitespaceAffectedByKey => (
						(whitespaceAffectedByKeys as readonly string[]).includes(key)
					)
				);
			}

			return heritablePropertyKeysWhichAffectWhitespace;
		};

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

		const outputWithInheritanceDisabled = () => {
			output.unshift('');
			return output;
		};

		for (let i = 1; i < output.length; i++) {
			const subcomponent = output[i];

			if (typeof subcomponent === 'object') {
				let subcomponentIsWhitespace = false;

				if ('text' in subcomponent) {
					const text = subcomponent.text.toString();
					const stringAffected = isStringAffected(text);

					if (stringAffected) {
						return outputWithInheritanceDisabled();
					}

					if (stringAffected === false) {
						continue;
					}

					subcomponentIsWhitespace = !notWhitespace.test(text);
				}

				/** All the keys of the first subcomponent which must be overwritten by this subcomponent in order for this subcomponent to remain unaffected by the inheritance from the first component. */
				const keysWhichMustBeOverwritten = (
					subcomponentIsWhitespace
						? getHeritablePropertyKeysWhichAffectWhitespace()
						: getHeritablePropertyKeys()
				);
				if (keysWhichMustBeOverwritten.some(key => (
					subcomponent[key] === undefined
				))) {
					// A heritable property of the first subcomponent is missing from this subcomponent, so this subcomponent would inherit it.

					return outputWithInheritanceDisabled();
				}

				continue;
			}

			// If this point is reached, `subcomponent` is primitive.

			if (isStringAffected(subcomponent.toString()) === false) {
				continue;
			}

			return outputWithInheritanceDisabled();
		}
	}

	return output;
};

export default disableInheritanceIfNecessary;