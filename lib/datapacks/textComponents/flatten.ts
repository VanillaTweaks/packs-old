import type { JSONTextComponent } from 'sandstone';
import type { HeritableProperties } from 'lib/datapacks/textComponents/getHeritableProperties';
import getHeritableProperties from 'lib/datapacks/textComponents/getHeritableProperties';
import { ComponentClass } from 'sandstone/variables';

type FlatJSONTextComponentArray = [
	'',
	...Array<Exclude<JSONTextComponent, any[]> & { extra?: never }>
];

/**
 * Recursively spreads all arrays and `extra` properties of a text component into one big array.
 *
 * Necessarily returns an array with `''` as the first element, not minified.
 */
const flatten = (component: JSONTextComponent): FlatJSONTextComponentArray => {
	const flatArray: FlatJSONTextComponentArray = [''];

	const processSubcomponent = (
		subcomponent: JSONTextComponent,
		/** Properties for the subcomponent and its children to inherit. */
		properties: HeritableProperties = {}
	) => {
		if (
			typeof subcomponent === 'string'
			|| typeof subcomponent === 'number'
			|| typeof subcomponent === 'boolean'
		) {
			flatArray.push({
				...properties,
				text: subcomponent
			});
			return;
		}

		if (Array.isArray(subcomponent)) {
			if (subcomponent.length) {
				const heritableProperties = getHeritableProperties(subcomponent[0]);
				for (const element of subcomponent) {
					processSubcomponent(element, heritableProperties);
				}
			}

			return;
		}

		if (subcomponent instanceof ComponentClass) {
			throw new Error('TODO: Handle `ComponentClass`.');
		}

		const { extra, ...subcomponentWithoutExtra } = subcomponent;

		flatArray.push({
			...properties,
			...subcomponentWithoutExtra
		});

		if (extra !== undefined) {
			properties = {
				...properties,
				...getHeritableProperties(subcomponent)
			};
			for (const element of extra) {
				processSubcomponent(element, properties);
			}
		}
	};

	processSubcomponent(component);

	return flatArray;
};

export default flatten;