import type { JSONTextComponent, TextComponentObject } from 'sandstone';
import minify from 'lib/datapacks/textComponents/minify';
import disableArrayInheritance from 'lib/datapacks/textComponents/disableArrayInheritance';

/**
 * Transforms a `JSONTextComponent` to have the specified default color, automatically minified.
 *
 * Disables array inheritance on the inputted component.
 */
const color = (
	colorValue: NonNullable<TextComponentObject['color']>,
	component: JSONTextComponent
) => (
	minify([
		{ text: '', color: colorValue },
		disableArrayInheritance(component)
	])
);

export default color;