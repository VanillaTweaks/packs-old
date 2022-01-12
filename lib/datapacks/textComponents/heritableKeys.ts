const heritableKeys = [
	'color',
	'font',
	'bold',
	'italic',
	'underlined',
	'strikethrough',
	'obfuscated',
	'insertion',
	'clickEvent',
	'hoverEvent'
] as const;

export default heritableKeys;

export type HeritableKey = typeof heritableKeys[number];

export const whitespaceUnaffectedByKeys = [
	'color',
	'italic'
] as const;

export type WhitespaceUnaffectedByKey = typeof whitespaceUnaffectedByKeys[number];

export type WhitespaceAffectedByKey = Exclude<HeritableKey, WhitespaceUnaffectedByKey>;

export const whitespaceAffectedByKeys: readonly WhitespaceAffectedByKey[] = (
	heritableKeys.filter(
		(key): key is WhitespaceAffectedByKey => (
			!(whitespaceUnaffectedByKeys as readonly string[]).includes(key)
		)
	)
);