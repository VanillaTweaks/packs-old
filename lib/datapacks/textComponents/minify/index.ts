import type { JSONTextComponent } from 'sandstone';
import generateMerged from 'lib/datapacks/textComponents/minify/generateMerged';
import disableInheritanceIfNecessary from 'lib/datapacks/textComponents/minify/disableInheritanceIfNecessary';
import { generateFlat } from 'lib/datapacks/textComponents/flatten';
import generateReduced from 'lib/datapacks/textComponents/minify/generateReduced';

/** Transforms a `JSONTextComponent` to be as short and simplified as possible while keeping it indistinguishable in-game. */
const minify = (component: JSONTextComponent) => {
	let outputGenerator = generateFlat(component);
	outputGenerator = generateReduced(outputGenerator);
	outputGenerator = generateMerged(outputGenerator);

	// TODO: Factor common properties out via array inheritance. For example,
	// [{ text: 'a', color: 'red' }, { text: 'b', color: 'green' }, { text: 'c', color: 'blue' }, { text: 'd', color: 'green' }]
	// should minify to
	// [{ text: 'a', color: 'red' }, [{ text: 'b', color: 'green' }, { text: 'c', color: 'blue' }, 'd']]

	const output = [...outputGenerator];

	return (
		output.length === 0
			? ''
			: output.length === 1
				? output[0]
				: disableInheritanceIfNecessary(output)
	);
};

export default minify;