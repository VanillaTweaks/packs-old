import getHeritableKeys from 'lib/datapacks/textComponents/getHeritableKeys';
import type { FlatJSONTextComponent } from 'lib/datapacks/textComponents/flatten';
import isAffectedByInheriting from 'lib/datapacks/textComponents/minify/isAffectedByInheriting';

/**
 * Returns the `output` array with `''` inserted at the beginning, only if necessary to prevent other subcomponents from inheriting properties from the first.
 *
 * ⚠️ Only for use in `minify`. Assumes `output.length > 1`. May mutate the `output` array.
 */
const disableInheritanceIfNecessary = (output: FlatJSONTextComponent[]) => {
	// Check if other subcomponents would inherit unwanted properties from the first subcomponent.

	/** The first subcomponent's heritable keys. */
	const keys = getHeritableKeys(output[0]);

	if (keys.length) {
		for (let i = 1; i < output.length; i++) {
			const subcomponent = output[i];

			if (isAffectedByInheriting(subcomponent, keys)) {
				output.unshift('');
				break;
			}
		}
	}

	return output;
};

export default disableInheritanceIfNecessary;