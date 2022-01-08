import pack from 'lib/datapacks/pack';
import type { ResourceLocationInstance } from 'lib/datapacks/ResourceLocation';

/**
 * Gets a template tag function which outputs NBT data paths on an item used by a `ResourceLocation` (the `pack` by default).
 *
 * Example:
 *
 * ```
 * const itemData = getItemDataPath();
 *
 * itemData`` === 'data.namespace'
 * itemData`something[-1]` === `data.namespace.something[-1]`
 * ```
 */
const getItemDataPath = (resourceLocation: ResourceLocationInstance = pack) => (
	(template: TemplateStringsArray, ...substitutions: any[]) => {
		const input = template.map((string, i) => string + (i in substitutions ? substitutions[i] : '')).join('');

		return `data.${resourceLocation.namespace}${input ? `.${input}` : ''}`;
	}
);

export default getItemDataPath;