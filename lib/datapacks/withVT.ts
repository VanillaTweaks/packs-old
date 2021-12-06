import type { BasePathInstance } from 'sandstone';

/** The properties of all `VTBasePath`s which are not on `BasePathInstance`. */
type ExclusiveVTBasePathProperties = {
	/**
	 * Get a child path of the current `BasePath`.
	 *
	 * The namespace cannot be provided in a child path.
	 */
	child: (...args: Parameters<BasePathInstance['child']>) => VTBasePath
};

/** A VT `BasePath`. */
export type VTBasePath = (
	BasePathInstance extends (...args: infer Args) => infer ReturnValue
		? (
			((...args: Args) => ReturnValue)
			& Omit<BasePathInstance, 'child'>
			& ExclusiveVTBasePathProperties
		)
		: never
);

/** The properties of all `RootVTBasePath`s which are not on `VTBasePath`s. */
type ExclusiveRootVTBasePathProperties = {
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

/** A VT `BasePath` which was *not* returned from `basePath.child(...)`. Extends `VTBasePath`. */
export type RootVTBasePath = VTBasePath & ExclusiveRootVTBasePathProperties;

/** This function extends `BasePath`s and should wrap every new instance of one. */
const withVT = (basePath: BasePathInstance): RootVTBasePath => {
	const createChild = basePath.child.bind(basePath);

	/** Properties assigned to all `VTBasePath`s. */
	const vtProperties: ExclusiveVTBasePathProperties = {
		// `withVT` normally returns a `RootVTBasePath`, but child `BasePath`s should not be `RootVTBasePath`s, so the assertion `as VTBasePath` is necessary.
		child: (...args) => withVT(createChild(...args)) as VTBasePath
	};

	const self: VTBasePath = Object.assign(basePath, vtProperties);

	if (!basePath.directory) {
		/** Properties assigned to all `RootVTBasePath`s. */
		const vtRootProperties: ExclusiveRootVTBasePathProperties = {
			pre: (template, ...substitutions) => (
				rootSelf.namespace
				+ template.map((string, i) => string + (i in substitutions ? substitutions[i] : '')).join('')
			)
		};

		const rootSelf: RootVTBasePath = Object.assign(self, vtRootProperties);

		return rootSelf;
	}

	// `self` is not actually a `RootVTBasePath`, but `vtProperties.child` should be the only case where this `return` is executed, in which case it is asserted back `as VTBasePath` outside this function.
	return self as RootVTBasePath;
};

export default withVT;