import type { BasePathInstance } from 'sandstone';
import { BasePath } from 'sandstone';

/** The properties of `VTBasePathInstance` which are not the same in `BasePathInstance`. */
type ExclusiveVTBasePathInstanceProperties = {
	/**
	 * Get a child path of the current base path.
	 *
	 * The namespace cannot be provided in a child path.
	 */
	child: (...args: Parameters<BasePathInstance['child']>) => VTBasePathInstance,
	/**
	 * A template tag function which prepends the `BasePath`'s namespace to the input, separated by a period.
	 *
	 * This should always be used instead of writing a `BasePath`'s namespace explicitly.
	 *
	 * Example:
	 * ```
	 * VT.pre`example` === 'vanillatweaks.example'
	 * ```
	 */
	pre: (template: TemplateStringsArray, ...substitutions: any[]) => string
};

/** A `BasePathInstace` with some extra properties. */
export type VTBasePathInstance = (
	BasePathInstance extends (...args: infer Args) => infer ReturnValue
		? (
			((...args: Args) => ReturnValue)
			& Omit<BasePathInstance, keyof ExclusiveVTBasePathInstanceProperties>
			& ExclusiveVTBasePathInstanceProperties
		)
		: never
);

/** Extends `BasePath`s into `VTBasePathInstance`s. */
const withVT = (basePath: BasePathInstance): VTBasePathInstance => {
	const basePathChild = basePath.child.bind(basePath);

	/** Properties assigned to all `VTBasePathInstance`s. */
	const vtProperties: ExclusiveVTBasePathInstanceProperties = {
		child: (...args) => withVT(basePathChild(...args)),
		pre: (template, ...substitutions) => (
			vtBasePath.namespace
			+ template.map((string, i) => string + (i in substitutions ? substitutions[i] : '')).join('')
		)
	};

	/** The `VTBasePathInstance` returned by this function. */
	const vtBasePath = Object.assign(basePath, vtProperties);

	return vtBasePath;
};

/** Creates a `BasePathInstance` with some extra properties. Should always be used instead of `BasePath`. */
const VTBasePath = (...args: Parameters<typeof BasePath>) => (
	withVT(BasePath(...args))
);

export default VTBasePath;