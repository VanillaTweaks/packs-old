import getHeritableKeys from 'lib/datapacks/textComponents/getHeritableKeys';
import type { JSONTextComponent } from 'sandstone';
import isAffectedByInheriting from 'lib/datapacks/textComponents/minify/isAffectedByInheriting';
import { generateFlat } from 'lib/datapacks/textComponents/flatten';

/**
 * Returns the `subcomponents` array with `''` inserted at the beginning, only if necessary to prevent other subcomponents from inheriting properties from the first.
 *
 * ⚠️ Only for use in `minify`. Assumes `subcomponents.length > 1`. May mutate the `subcomponents` array.
 */
const disableInheritanceIfNecessary = (subcomponents: JSONTextComponent[]) => {
	// Check if other subcomponents would inherit unwanted properties from the first subcomponent.

	/** The first subcomponent's heritable keys. */
	const heritableKeys = getHeritableKeys(subcomponents[0]);

	if (heritableKeys.length) {
		checkingSubcomponents:
		for (let i = 1; i < subcomponents.length; i++) {
			const subcomponent = subcomponents[i];

			for (const flatSubcomponent of generateFlat(subcomponent)) {
				if (isAffectedByInheriting(flatSubcomponent, heritableKeys)) {
					subcomponents.unshift('');
					break checkingSubcomponents;
				}
			}
		}
	}

	return subcomponents;
};

export default disableInheritanceIfNecessary;