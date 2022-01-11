import type { JSONTextComponent } from 'sandstone';
import heritableKeys from 'lib/datapacks/textComponents/heritableKeys';
import { ComponentClass } from 'sandstone/variables';

/** Checks whether a `JSONTextComponent` has any properties which can be inherited by other text components. */
const hasHeritableProperties = (component: JSONTextComponent): boolean => {
	if (Array.isArray(component)) {
		return hasHeritableProperties(component[0]);
	}

	if (component instanceof ComponentClass) {
		throw new Error('TODO: Handle `ComponentClass`.');
	}

	if (typeof component === 'object') {
		for (const key of heritableKeys) {
			if (component[key] !== undefined) {
				return true;
			}
		}
	}

	return false;
};

export default hasHeritableProperties;