import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';

/**
 * Returns a child of the specified `BasePath` whose directory is named to discourage users from running functions and function tags created in it.
 *
 * Every `MCFunction` or `Tag<'functions'>` should always be created under a `getInternalChild(basePath)` instead of a `basePath` unless there is intent for it to be run freely by users.
 *
 * ⚠️ Please use `basePath_` instead of `getInternalChild(basePath)` wherever possible. Ideally, this function should only ever be called once per `BasePath`.
 */
const getInternalChild = (basePath: VTBasePathInstance) => (
	basePath.child({
		directory: 'zz/do_not_run_or_the_pack_may_break'
	})
);

export default getInternalChild;