import type { JSONTextComponent, TextComponentObject } from 'sandstone';
import heritableKeys from 'lib/datapacks/textComponents/heritableKeys';
import { ComponentClass } from 'sandstone/variables';

export type HeritableKey = typeof heritableKeys[number];

export type HeritableProperties = {
	[Key in HeritableKey]?: TextComponentObject[Key]
};

/** Gets an object of only the properties of a `JSONTextComponent` which can be inherited by other text components, or `undefined` if it has no such properties. */
const getHeritableProperties = (component: JSONTextComponent): HeritableProperties | undefined => {
	if (Array.isArray(component)) {
		return getHeritableProperties(component[0]);
	}

	if (component instanceof ComponentClass) {
		throw new Error('TODO: Handle `ComponentClass`.');
	}

	let heritableProperties: HeritableProperties | undefined;

	if (typeof component === 'object') {
		for (const key of heritableKeys) {
			if (component[key] !== undefined) {
				if (heritableProperties === undefined) {
					heritableProperties = {};
				}

				heritableProperties[key] = component[key] as any;
			}
		}
	}

	return heritableProperties;
};

export default getHeritableProperties;