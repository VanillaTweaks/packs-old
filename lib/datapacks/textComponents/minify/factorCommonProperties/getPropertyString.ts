export type PropertyString = `,"${string}":${string}`;

/** Gets a string that both uniquely identifies a property and represents the number of characters which a single instance of that property generally requires via its length. */
const getPropertyString = (key: string, value: unknown): PropertyString => (
	`,"${key}":${JSON.stringify(value)}`
);

export default getPropertyString;