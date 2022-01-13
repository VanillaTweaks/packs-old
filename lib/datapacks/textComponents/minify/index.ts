import type { JSONTextComponent, TextComponentObject } from 'sandstone';
import flattenAndMerge from 'lib/datapacks/textComponents/minify/flattenAndMerge';
import disableInheritanceIfNecessary from 'lib/datapacks/textComponents/minify/disableInheritanceIfNecessary';

export type MinifyOutputArray = Array<TextComponentObject | string>;

/** Transforms a `JSONTextComponent` to be as short and simplified as possible while keeping it indistinguishable in-game. */
const minify = (component: JSONTextComponent) => {
	const output: MinifyOutputArray = [];

	flattenAndMerge(component, output);

	disableInheritanceIfNecessary(output);

	return (
		output.length === 0
			? ''
			: output.length === 1
				? output[0]
				: output
	);
};

export default minify;