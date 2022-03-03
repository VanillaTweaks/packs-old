import type { JSONTextComponent } from 'sandstone';
import generateMerged from 'lib/datapacks/textComponents/minify/generateMerged';
import disableInheritanceIfNecessary from 'lib/datapacks/textComponents/minify/disableInheritanceIfNecessary';
import { generateFlat } from 'lib/datapacks/textComponents/flatten';
import generateReduced from 'lib/datapacks/textComponents/minify/generateReduced';
import factorCommonProperties from 'lib/datapacks/textComponents/minify/factorCommonProperties';
import getHeritableKeys from 'lib/datapacks/textComponents/getHeritableKeys';
import isAffectedByInheriting from 'lib/datapacks/textComponents/minify/isAffectedByInheriting';

/** Transforms a `JSONTextComponent` to be as short and simplified as possible while keeping it indistinguishable in-game. */
const minify = (component: JSONTextComponent) => {
	let outputGenerator = generateFlat(component);
	outputGenerator = generateReduced(outputGenerator);
	outputGenerator = generateMerged(outputGenerator);

	const unfactoredOutput = [...outputGenerator];

	if (unfactoredOutput.length === 1) {
		return unfactoredOutput[0];
	}

	if (unfactoredOutput.length === 0) {
		return '';
	}

	const factoredOutput = factorCommonProperties(unfactoredOutput);

	if (factoredOutput.length === 1) {
		return factoredOutput[0];
	}

	const output = disableInheritanceIfNecessary(factoredOutput);

	return output;
};

export default minify;