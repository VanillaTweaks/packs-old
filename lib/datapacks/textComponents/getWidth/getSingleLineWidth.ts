import type { JSONTextComponent } from 'sandstone';
import { generateFlat } from 'lib/datapacks/textComponents/flatten';
import getSingleLineStringWidth from 'lib/datapacks/textComponents/getWidth/getSingleLineStringWidth';

/**
 * Gets the width in in-game pixels that a `JSONTextComponent` takes up.
 *
 * ⚠️ Assumes the input does not contain line breaks.
 */
const getSingleLineWidth = (component: JSONTextComponent) => {
	if (typeof component !== 'object') {
		return getSingleLineStringWidth(component.toString());
	}

	let width = 0;

	for (const subcomponent of generateFlat(component)) {
		if (typeof subcomponent === 'object') {
			if ('text' in subcomponent) {
				width += getSingleLineStringWidth(
					subcomponent.text.toString(),
					subcomponent
				);
				continue;
			}

			throw new TypeError(
				'It is impossible to determine the width of the following text component:\n'
				+ JSON.stringify(subcomponent)
			);
		}

		// If this point is reached, `subcomponent` is primitive.

		width += getSingleLineStringWidth(subcomponent.toString());
	}

	return width;
};

export default getSingleLineWidth;