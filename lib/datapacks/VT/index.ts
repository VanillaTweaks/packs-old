import getInternalChild from 'lib/datapacks/getInternalChild';
import VTBasePath from 'lib/datapacks/VTBasePath';

/** The `BasePath` for the `vanillatweaks` namespace. */
const VT = VTBasePath({ namespace: 'vanillatweaks' });

export default VT;

/**
 * A child `BasePath` of `VT` whose directory is named to discourage users from running functions and function tags created in it.
 *
 * Every `MCFunction` or `Tag<'functions'>` should always be created under this instead of `VT` unless there is intent for it to be run freely by users.
 */
export const VT_ = getInternalChild(VT);