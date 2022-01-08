export type VersionString = `${number}.${number}.${number}`;

type Version = VersionString & {
	major: number,
	minor: number,
	patch: number
};

export default Version;