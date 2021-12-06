import getInternalChild from 'lib/datapacks/getInternalChild';
import VTBasePath from 'lib/datapacks/VTBasePath';

/** The `BasePath` for the `vanillatweaks` namespace. */
const VT = VTBasePath({
	namespace: 'vanillatweaks',
	onConflict: {
		// This is so a library functions that create resources (e.g. `execute...run(...)` creating an `MCFunction`) don't try to create them multiple times when called multiple times.
		default: 'ignore'
	}
});

export default VT;

/**
 * A child `BasePath` of `VT` whose directory is named to discourage users from running functions and function tags created in it.
 *
 * Every `MCFunction` or `Tag<'functions'>` should always be created under this unless there is intent for it to be run freely by users.
 */
export const VT_ = getInternalChild(VT);