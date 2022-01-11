import type { JSONTextComponent, TextComponentObject } from 'sandstone';
import type { HeritableProperties } from 'lib/datapacks/textComponents/getHeritableProperties';
import getHeritableProperties from 'lib/datapacks/textComponents/getHeritableProperties';
import { ComponentClass } from 'sandstone/variables';

export type FlatJSONTextComponent = TextComponentObject & { extra?: never };

/**
 * Generates the series of `TextComponentObject`s needed to recursively spread all arrays and `extra` properties of a text component into one big array.
 *
 * Does not transform `with` properties at all.
 */
export const generateFlat = function* (
	component: JSONTextComponent,
	/** Properties for the component and its children to inherit. */
	properties: HeritableProperties = {}
): Generator<FlatJSONTextComponent, undefined> {
	if (component instanceof ComponentClass) {
		throw new Error('TODO: Handle `ComponentClass`.');
	}

	if (
		typeof component === 'string'
		|| typeof component === 'number'
		|| typeof component === 'boolean'
	) {
		yield {
			text: component,
			...properties
		};
		return;
	}

	if (Array.isArray(component)) {
		if (component.length) {
			const heritableProperties = getHeritableProperties(component[0]);
			for (const element of component) {
				yield* generateFlat(element, heritableProperties);
			}
		}

		return;
	}

	const { extra, ...subcomponentWithoutExtra } = component;

	yield {
		...properties,
		...subcomponentWithoutExtra
	};

	if (extra !== undefined) {
		properties = {
			...properties,
			...getHeritableProperties(component)
		};
		for (const element of extra) {
			yield* generateFlat(element, properties);
		}
	}
};

/**
 * Recursively spreads all arrays and `extra` properties of a text component into one big array.
 *
 * Necessarily returns an array with `''` as the first element.
 *
 * Does not transform `with` properties at all.
 */
const flatten = (component: JSONTextComponent): ['', ...FlatJSONTextComponent[]] => (
	['', ...generateFlat(component)]
);

export default flatten;