import type PropertyStart from 'lib/datapacks/textComponents/minify/factorCommonProperties/PropertyStart';

/** Adjusts the `index`es and `occurrences` of all properties according to the specified function. */
const adjustPropertyIndexes = (
	properties: PropertyStart[],
	adjustIndex: (index: number) => number
) => {
	for (const property of properties) {
		property.index = adjustIndex(property.index);
		property.end.index = adjustIndex(property.end.index);
		for (let i = 0; i < property.occurrences.length; i++) {
			property.occurrences[i] = adjustIndex(property.occurrences[i]);
		}
	}
};

export default adjustPropertyIndexes;