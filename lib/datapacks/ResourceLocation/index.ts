import type { VersionString } from 'lib/datapacks/ResourceLocation/Version';
import type Version from 'lib/datapacks/ResourceLocation/Version';

export type ResourceLocationOptions<
	Title extends string | undefined = string | undefined,
	GenericVersion extends VersionString | undefined = VersionString | undefined
> = {
	title?: Title,
	/** The version to set for this `ResourceLocation`'s `loadStatus` scores, if this `ResourceLocation` has a `load` function. */
	version?: GenericVersion,
	/**
	 * Whether the `ResourceLocation` represents an outside namespace rather than one originating from Vanilla Tweaks.
	 *
	 * Setting this to `true` disables the `PRIVATE_PATH` shorthand and strict name checks.
	 */
	external?: boolean
};

type ResourceLocationInstanceFunction = (
	template: TemplateStringsArray,
	...substitutions: any[]
) => string;

type ResourceLocationInstanceProperties<
	Base extends string = string,
	Title extends string | undefined = string | undefined,
	GenericVersion extends VersionString | undefined = VersionString | undefined
> = Readonly<{
	namespace: string,
	path: (
		Base extends `${string}:${string}`
			? string
			: string | undefined
	),
	/** Creates a new `ResourceLocation` with a base path relative to the parent resource location. */
	child: <
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
		options?: ResourceLocationOptions<ChildTitle, ChildVersion>
	) => ResourceLocationInstance<`${string}:${string}`, ChildTitle, ChildVersion>,
	title: Title,
	version: GenericVersion extends string ? Version : undefined
}>;

export type ResourceLocationInstance<
	Base extends string = string,
	Title extends string | undefined = string | undefined,
	GenericVersion extends VersionString | undefined = VersionString | undefined
> = ResourceLocationInstanceFunction & ResourceLocationInstanceProperties<Base, Title, GenericVersion>;

/** A resource location path named to discourage players from running functions and function tags under it. */
const PRIVATE_PATH = 'zz/do_not_run_or_packs_may_break';

/**
 * A constructor for a representation of a Minecraft resource location (namespaced path).
 *
 * Examples:
 *
 * ```
 * const namespace = ResourceLocation('namespace');
 * const somethingElse = ResourceLocation('something:else');
 * const path = namespace.child('path');
 * const anotherPath = namespace.child('another/path');
 * const subpath = path.child('subpath');
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
 * namespace`.thing_1` === 'namespace.thing_1'
 * path`.thing_2` === 'namespace.path.thing_2'
 * ```
 */
const ResourceLocation = <
	Base extends string = string,
	Title extends string | undefined = string | undefined,
	GenericVersion extends VersionString | undefined = VersionString | undefined
>(
	/**
	 * The start of a Minecraft resource location string.
	 *
	 * Examples:
	 *
	 * * `'namespace'`
	 * * `'namespace:some/path'`
	 */
	base: Base,
	options: ResourceLocationOptions<Title, GenericVersion> = {}
): ResourceLocationInstance<Base, Title, GenericVersion> => {
	const nameTest = (
		options.external
			// Accepts anything that Minecraft accepts (except empty string).
			? /^[a-z0-9_.-]+$/
			// Accepts only names which follow our naming conventions.
			: /^[a-z0-9]+(?:_[a-z0-9]+)*$/
	);

	/**
	 * Ensures a namespace, directory, or resource name is valid and conventional.
	 *
	 * Unless the `external` option is `true`, this is intentionally more restrictive than Minecraft's requirements for namespace or directory names.
	 */
	const checkName = (name: string) => {
		if (!nameTest.test(name)) {
			throw new TypeError(`The following name is invalid or unconventional: ${JSON.stringify(name)}`);
		}
	};

	const colonIndex = base.indexOf(':');

	const namespace = (
		colonIndex === -1
			? base
			: base.slice(0, colonIndex)
	);
	checkName(namespace);

	const path = (
		colonIndex === -1
			? undefined
			: base.slice(colonIndex + 1)
	);
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

	const resourceLocation: ResourceLocationInstance<Base, Title, GenericVersion> = Object.assign<ResourceLocationInstanceFunction, ResourceLocationInstanceProperties<Base, Title, GenericVersion>>(
		(template, ...substitutions) => {
			const input = template.map((string, i) => string + (i in substitutions ? substitutions[i] : '')).join('');

			if (input.startsWith('.')) {
				const inputSegments = input.slice(1).split('.');
				inputSegments.forEach(checkName);

				if (input.startsWith('.')) {
					return [
						namespace,
						...pathSegments,
						...inputSegments
					].join('.');
				}
			}

			if (input.startsWith('#')) {
				return '#' + resourceLocation`${input.slice(1)}`;
			}

			const inputSegments = input.split('/');
			const lastInputSegment = inputSegments[inputSegments.length - 1];

			const outputSegments = [...pathSegments];

			if (!options.external && lastInputSegment.startsWith('_')) {
				inputSegments[inputSegments.length - 1] = lastInputSegment.slice(1);
				outputSegments.unshift(PRIVATE_PATH);
			}

			inputSegments.forEach(checkName);
			outputSegments.push(...inputSegments);

			return `${namespace}:` + outputSegments.join('/');
		},
		{
			namespace,
			path: path as any,
			child: (relativePath, childOptions) => (
				ResourceLocation(
					resourceLocation`${relativePath}` as `${string}:${string}`,
					childOptions
				)
			),
			title: options.title as any,
			version: version as any
		}
	);

	return resourceLocation;
};

export default ResourceLocation;