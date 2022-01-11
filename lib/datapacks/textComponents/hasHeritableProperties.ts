import type { JSONTextComponent } from 'sandstone';
import heritableKeys from 'lib/datapacks/textComponents/heritableKeys';

/** Checks if a text component has any heritable special formatting. */
const hasHeritableProperties = (component: JSONTextComponent): boolean => {
	if (Array.isArray(component)) {
		return hasHeritableProperties(component[0]);
	}

	if (typeof component === 'object') {
		if ('text' in component) {
			for (const key of heritableKeys) {
				if (key in component) {
					return true;
				}
			}

			return false;
		}

		// TODO: This is wrong, but currently necessary due to `canMergeComponents` depending on this case returning `true`.
		return true;
	}

	return false;
};

export default hasHeritableProperties;