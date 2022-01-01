import type { BasePathInstance, BasePathOptions } from 'sandstone';
import { BasePath } from 'sandstone';

export type VersionString = `${number}.${number}.${number}`;
export type Version = VersionString & {
	major: number,
	minor: number,
	patch: number
};

export type VTBasePathOptions<
	Directory extends string | undefined = string | undefined,
	Title extends string | undefined = string | undefined,
	BasePathVersion extends VersionString | undefined = VersionString | undefined
> = BasePathOptions<string, Directory> & {
	title?: Title,
	/** The version to set for this `BasePath` in Lantern Load's status objective, if this `BasePath` has a `load` function. */
	version?: BasePathVersion
};

export type VTBasePathChildOptions<
	Title extends string | undefined = string | undefined,
	BasePathVersion extends VersionString | undefined = VersionString | undefined
> = (
	Omit<VTBasePathOptions<string, Title, BasePathVersion>, 'namespace'>
	& Required<Pick<VTBasePathOptions<string, Title, BasePathVersion>, 'directory'>>
);

/** The properties of `VTBasePathInstance` which are not the same in `BasePathInstance`. */
type ExclusiveVTBasePathInstanceProperties<
	Title extends string | undefined = string | undefined,
	BasePathVersion extends string | undefined = string | undefined
> = {
	/**
	 * Get a child path of the current base path.
	 *
	 * The namespace cannot be provided in a child path.
	 */
	child: <
		ChildTitle extends string | undefined = string | undefined,
		ChildVersion extends VersionString | undefined = VersionString | undefined
	>(options: VTBasePathChildOptions<ChildTitle, ChildVersion>) => (
		VTBasePathInstance<string, ChildTitle, ChildVersion>
	),
	title: Title,
	version: BasePathVersion extends string ? Version : undefined
};

/** A `BasePathInstace` with some extra properties. */
export type VTBasePathInstance<
	Directory extends string | undefined = string | undefined,
	Title extends string | undefined = string | undefined,
	BasePathVersion extends string | undefined = string | undefined
> = (
	BasePathInstance<string, Directory> extends (...args: infer Args) => infer ReturnValue
		? (
			((...args: Args) => ReturnValue)
			& Omit<BasePathInstance<string, Directory>, keyof ExclusiveVTBasePathInstanceProperties<Title, BasePathVersion>>
			& ExclusiveVTBasePathInstanceProperties<Title, BasePathVersion>
		)
		: never
);

/** Extends a `BasePath` into a `VTBasePathInstance`. */
const withVT = <
	Directory extends string | undefined = string | undefined,
	Title extends string | undefined = string | undefined,
	BasePathVersion extends VersionString | undefined = VersionString | undefined
>(
	basePath: BasePathInstance<string, Directory>,
	options: VTBasePathOptions<Directory, Title, BasePathVersion>
): VTBasePathInstance<Directory, Title, BasePathVersion> => {
	const basePathChild = basePath.child.bind(basePath);

	let version: string extends BasePathVersion ? Version : undefined;
	if (options.version) {
		const versionNumbers = options.version.split('.').map(Number);

		version = Object.assign(options.version, {
			major: versionNumbers[0],
			minor: versionNumbers[1],
			patch: versionNumbers[2]
		}) as any;
	}

	/** Properties assigned to all `VTBasePathInstance`s. */
	const vtProperties: ExclusiveVTBasePathInstanceProperties<Title, BasePathVersion> = {
		child: <
			ChildTitle extends string | undefined = string | undefined,
			ChildVersion extends VersionString | undefined = VersionString | undefined
		>(childOptions: VTBasePathChildOptions<ChildTitle, ChildVersion>) => (
			withVT<string, ChildTitle, ChildVersion>(
				basePathChild<string>(childOptions),
				childOptions
			)
		),
		title: options.title as any,
		version: version as any
	};

	/** The `VTBasePathInstance` returned by this function. */
	const vtBasePath = Object.assign(basePath, vtProperties);

	return vtBasePath;
};

/** Creates a `BasePathInstance` with some extra properties. Should always be used instead of `BasePath`. */
const VTBasePath = <
	Directory extends string | undefined,
	Title extends string | undefined,
	BasePathVersion extends VersionString | undefined
>(
	options: VTBasePathOptions<Directory, Title, BasePathVersion>
): VTBasePathInstance<Directory, Title, BasePathVersion> => (
	withVT<Directory, Title, BasePathVersion>(
		BasePath<string, Directory>(options),
		options
	)
);

export default VTBasePath;