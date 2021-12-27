import internalBasePath from 'lib/datapacks/internalBasePath';
import VTBasePath from 'lib/datapacks/VTBasePath';

/** The `BasePath` for the `vanillatweaks` namespace. */
const vt = VTBasePath({ namespace: 'vanillatweaks' });

export default vt;

/**
 * A child `BasePath` of `vt` whose directory is named to discourage users from running functions and function tags created in it.
 *
 * Every `MCFunction` or `Tag<'functions'>` should always be created under this instead of `vt` unless there is intent for it to be run freely by users.
 */
export const vt_ = internalBasePath(vt);