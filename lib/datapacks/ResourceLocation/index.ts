import type { VersionString } from 'lib/datapacks/ResourceLocation/Version';
import type Version from 'lib/datapacks/ResourceLocation/Version';

/** A resource location path named to discourage players from running functions and function tags under it. */
const PRIVATE_PATH = 'zz/do_not_run_or_packs_may_break';

/** A type for invalid or unconventional snake case names which `ResourceLocationInstance` should not be mapped to a `string`. Unfortunately not comprehensive. */
type InvalidNameString = (
	`_${string}`
	| `${string}_`
	| `${string}__${string}`
	| `${string}${'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z' | '$'}${string}`
);

/** Checks for a valid and conventional snake case name. */
const nameTest = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

export type ResourceLocationOptions<
	Title extends string | undefined = string | undefined,
	GenericVersion extends VersionString | undefined = VersionString | undefined
> = Partial<{
	title: Title,
	/** The version to set for this `ResourceLocation`'s `loadStatus` scores, if this `ResourceLocation` has a `load` function. */
	version: GenericVersion,
	/**
	 * Whether the `ResourceLocation` represents an outside namespace rather than one originating from Vanilla Tweaks.
	 *
	 * If `true`, disables strict name checks.
	 */
	external: boolean
}>;

type ResourceLocationTemplateTag = (
	template: TemplateStringsArray,
	...substitutions: unknown[]
) => string;

type ResourceLocationProperties<
	Namespace extends string = string,
	Path extends string | undefined = string | undefined,
	Title extends string | undefined = string | undefined,
	GenericVersion extends VersionString | undefined = VersionString | undefined
> = Readonly<Record<string, string> & Partial<Record<InvalidNameString, never>> & {
	toString: () => string,
	NAMESPACE: Namespace,
	PATH: Path,
	/** Creates a new `ResourceLocation` with a base path relative to the parent resource location. */
	getChild: <
		ChildTitle extends string | undefined = string | undefined,
		ChildVersion extends VersionString | undefined = VersionString | undefined
	>(
		/**
		 * The path of the child relative to the parent resource location.
		 *
		 * Examples:
		 *
		 * * `'directory'`
		 * * `'some/path'`
		 */
		relativePath: string,
		options?: Omit<ResourceLocationOptions<ChildTitle, ChildVersion>, 'external'>
	) => ResourceLocationInstance<Namespace, string, ChildTitle, ChildVersion>,
	TITLE: Title,
	VERSION: GenericVersion extends string ? Version : undefined
}>;

export type ResourceLocationInstance<
	Namespace extends string = string,
	Path extends string | undefined = string | undefined,
	Title extends string | undefined = string | undefined,
	GenericVersion extends VersionString | undefined = VersionString | undefined
> = (
	ResourceLocationTemplateTag
	& ResourceLocationProperties<Namespace, Path, Title, GenericVersion>
);

/**
 * A constructor for a representation of a Minecraft resource location (namespaced path).
 *
 * Examples:
 *
 * ```
 * const namespace = ResourceLocation('namespace');
 * const somethingElse = ResourceLocation('something:else');
 * const path = namespace.getChild('path');
 * const anotherPath = namespace.getChild('another/path');
 * const subpath = path.getChild('subpath');
 *
 * namespace`resource` === 'namespace:resource'
 * path`resource` === 'namespace:path/resource'
 * subpath`resource` === 'namespace:path/subpath/resource'
 * anotherPath`another_resource` === 'namespace:another/path/another_resource'
 * somethingElse`directory/resource` === 'something:else/directory/resource'
 *
 * namespace`_resource` === `namespace:${PRIVATE_PATH}/resource`
 * namespace`path/_resource` === `namespace:${PRIVATE_PATH}/path/resource`
 * path`_resource` === `namespace:${PRIVATE_PATH}/path/resource`
 *
 * namespace`#function_tag` === '#namespace:function_tag'
 * namespace`#path/function_tag` === '#namespace:path/function_tag'
 * namespace`#path/_function_tag` === `#namespace:${PRIVATE_PATH}/path/function_tag`
 *
 * namespace.thing_1 === 'namespace.thing_1'
 * path.thing_2 === 'namespace.path.thing_2'
 *
 * const externalAPI = ResourceLocation('external:api', { external: true });
 *
 * externalAPI`_test` === `external:${PRIVATE_PATH}/api/test`
 * externalAPI`\_test` === 'external:api/_test'
 *
 * ResourceLocation(base).toString() === base
 * ```
 */
const ResourceLocation = <
	Namespace extends string = string,
	Path extends string | undefined = (
		string extends Namespace
			? string | undefined
			: undefined
	),
	Title extends string | undefined = undefined,
	GenericVersion extends VersionString | undefined = undefined
>(
	/**
	 * The start of a Minecraft resource location string.
	 *
	 * Examples:
	 *
	 * * `'namespace'`
	 * * `'namespace:some/path'`
	 */
	base: `${Namespace}:${Path}` | Namespace,
	options: ResourceLocationOptions<Title, GenericVersion> = {}
): ResourceLocationInstance<Namespace, Path, Title, GenericVersion> => {
	/**
	 * Ensures a namespace, directory, or resource name is valid and conventional.
	 *
	 * Unless the `external` option is `true`, this is intentionally more restrictive than Minecraft's requirements for namespace or directory names.
	 */
	const checkName = (name: string) => {
		if (!/^[a-z0-9_.-]+$/.test(name)) {
			throw new TypeError(`The following name is invalid: ${JSON.stringify(name)}`);
		}

		if (!options.external && !nameTest.test(name)) {
			throw new TypeError(`The following name is unconventional: ${JSON.stringify(name)}`);
		}
	};

	const colonIndex = base.indexOf(':');

	const namespace = (
		colonIndex === -1
			? base
			: base.slice(0, colonIndex)
	) as Namespace;
	checkName(namespace);

	const path = (
		colonIndex === -1
			? undefined
			: base.slice(colonIndex + 1)
	) as Path;
	let pathSegments: string[];
	if (path) {
		pathSegments = path.split('/');
		pathSegments.forEach(checkName);
	} else {
		pathSegments = [];
	}

	let version;
	if (options.version) {
		const versionNumbers = options.version.split('.').map(Number);

		version = Object.assign(options.version, {
			major: versionNumbers[0],
			minor: versionNumbers[1],
			patch: versionNumbers[2]
		});
	}

	const templateTag: ResourceLocationTemplateTag = (template, ...substitutions) => {
		let input = template.map((string, i) => string + (i in substitutions ? substitutions[i] : '')).join('');
		/**
		 * Same as `input` but includes escape characters.
		 *
		 * Check this for special characters rather than `input` to ensure the special characters aren't escaped.
		 */
		let rawInput = template.raw.map((string, i) => string + (i in substitutions ? substitutions[i] : '')).join('');

		let startsWithHash = false;
		if (rawInput.startsWith('#')) {
			startsWithHash = true;
			rawInput = rawInput.slice(1);
			input = input.slice(1);
		}

		const inputSegments = input.split('/');
		const outputSegments = [...pathSegments];

		if (rawInput[rawInput.lastIndexOf('/') + 1] === '_') {
			inputSegments[inputSegments.length - 1] = inputSegments[inputSegments.length - 1].slice(1);
			outputSegments.unshift(PRIVATE_PATH);
		}

		inputSegments.forEach(checkName);
		outputSegments.push(...inputSegments);

		return (
			(startsWithHash ? '#' : '')
			+ `${namespace}:`
			+ outputSegments.join('/')
		);
	};

	const properties = {
		toString: () => base,
		NAMESPACE: namespace,
		PATH: path,
		getChild: (relativePath, childOptions) => (
			ResourceLocation(
				`${namespace}:` + [...pathSegments, relativePath].join('/'),
				{
					external: options.external,
					...childOptions
				}
			)
		),
		TITLE: options.title,
		VERSION: version
	} as ResourceLocationProperties<Namespace, Path, Title, GenericVersion>;

	const instance: ResourceLocationInstance<Namespace, Path, Title, GenericVersion> = new Proxy(
		Object.assign(templateTag, properties),
		{
			get(target, key) {
				if (typeof key === 'string' && nameTest.test(key)) {
					return [namespace, ...pathSegments, key].join('.');
				}

				return target[key as any];
			}
		}
	);

	return instance;
};

export default ResourceLocation;