import type { HeritableProperties } from 'lib/datapacks/textComponents/getHeritableProperties';
import { whitespaceAffectedByKeys } from 'lib/datapacks/textComponents/heritableKeys';

/** Checks whether a `TextComponentObject` with only whitespace as its `text` would be indistinguishable with or without the specified properties. */
const whitespaceUnaffectedBy = (properties: HeritableProperties) => (
	// Check whether none of the properties affect whitespace.
	whitespaceAffectedByKeys.every(key => (
		properties[key] === undefined
	))
);

export default whitespaceUnaffectedBy;