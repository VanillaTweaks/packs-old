import getHeritableProperties from 'lib/datapacks/textComponents/getHeritableProperties';
import type { FlatJSONTextComponent } from 'lib/datapacks/textComponents/flatten';
import isAffectedByInheriting from 'lib/datapacks/textComponents/isAffectedByInheriting';

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
		for (let i = 1; i < output.length; i++) {
			const subcomponent = output[i];

			if (isAffectedByInheriting(subcomponent, heritableProperties)) {
				output.unshift('');
				break;
			}
		}
	}

	return output;
};

export default disableInheritanceIfNecessary;