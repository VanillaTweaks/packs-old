import pack from 'lib/datapacks/pack';
import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';

/**
 * Gets a template tag function which outputs NBT data paths on an item used by a `BasePath` (the `pack` by default).
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
const getItemDataPath = (basePath: VTBasePathInstance = pack) => (
	(template: TemplateStringsArray, ...substitutions: any[]) => {
		const input = template.map((string, i) => string + (i in substitutions ? substitutions[i] : '')).join('');

		return `data.${basePath.namespace}${input ? `.${input}` : ''}`;
	}
);

export default getItemDataPath;