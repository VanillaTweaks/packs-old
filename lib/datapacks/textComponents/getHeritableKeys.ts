import type { JSONTextComponent } from 'sandstone';
import type { HeritableKey } from 'lib/datapacks/textComponents/heritableKeys';
import heritableKeys from 'lib/datapacks/textComponents/heritableKeys';
import { ComponentClass } from 'sandstone/variables';

/** Gets an array of only the keys of a `JSONTextComponent` which can be inherited by other text components. */
const getHeritableKeys = (component: JSONTextComponent): HeritableKey[] => {
	if (typeof component === 'object') {
		if (Array.isArray(component)) {
			return getHeritableKeys(component[0]);
		}

		if (component instanceof ComponentClass) {
			throw new Error('TODO: Handle `ComponentClass`.');
		}

		return heritableKeys.filter(heritableKey => (
			component[heritableKey] !== undefined
		));
	}

	return [];
};

export default getHeritableKeys;