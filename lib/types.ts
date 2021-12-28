export type UnionOmit<Type, Key extends keyof any> = (
	Type extends any
		? Omit<Type, Key>
		: never
);