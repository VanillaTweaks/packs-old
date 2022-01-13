import type { JSONTextComponent } from 'sandstone';
import flattenAndMerge from 'lib/datapacks/textComponents/minify/flattenAndMerge';
import disableInheritanceIfNecessary from 'lib/datapacks/textComponents/minify/disableInheritanceIfNecessary';
import type { FlatJSONTextComponent } from 'lib/datapacks/textComponents/flatten';

export type MinifyOutputArray = FlatJSONTextComponent[];

/** Transforms a `JSONTextComponent` to be as short and simplified as possible while keeping it indistinguishable in-game. */
const minify = (component: JSONTextComponent) => {
	const output: MinifyOutputArray = [];

	flattenAndMerge(component, output);

	// TODO: Factor common properties out via array inheritance. For example,
	// [{ text: 'a', color: 'red' }, { text: 'b', color: 'green' }, { text: 'c', color: 'blue' }, { text: 'd', color: 'green' }]
	// should minify to
	// [{ text: 'a', color: 'red' }, [{ text: 'b', color: 'green' }, { text: 'c', color: 'blue' }, 'd']]

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