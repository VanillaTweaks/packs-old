import type { BasePathInstance } from 'sandstone';
import { BasePath } from 'sandstone';

/** The properties of `VTBasePathInstance` which are not the same in `BasePathInstance`. */
type ExclusiveVTBasePathInstanceProperties = {
	/**
	 * Get a child path of the current base path.
	 *
	 * The namespace cannot be provided in a child path.
	 */
	child: (...args: Parameters<BasePathInstance['child']>) => VTBasePathInstance
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

/** Extends a `BasePath` into a `VTBasePathInstance`. */
const withVT = (basePath: BasePathInstance): VTBasePathInstance => {
	const basePathChild = basePath.child.bind(basePath);

	/** Properties assigned to all `VTBasePathInstance`s. */
	const vtProperties: ExclusiveVTBasePathInstanceProperties = {
		child: (...args) => withVT(basePathChild(...args))
	};

	/** The `VTBasePathInstance` returned by this function. */
	const vtBasePath = Object.assign(basePath, vtProperties);

	return vtBasePath;
};

/** Creates a `BasePathInstance` with some extra properties. Should always be used instead of `BasePath`. */
const VTBasePath = (...args: Parameters<typeof BasePath>): VTBasePathInstance => (
	withVT(BasePath(...args))
);

export default VTBasePath;