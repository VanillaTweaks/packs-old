import type { RootVTBasePath } from 'lib/datapacks/vanillatweaks';

/**
 * Returns a child of the specified `BasePath` whose directory is named to discourage users from running functions and function tags created in it.
 *
 * Every `MCFunction` or `Tag<'functions'>` should always be created under this unless there is intent for it to be run freely by users.
 *
 * ⚠️ Please use `basePath_` instead of `getInternalChild(basePath)` wherever possible. Ideally, this function should only ever be called once per `BasePath`.
 */
const getInternalChild = (basePath: RootVTBasePath) => (
	basePath.child({
		directory: 'zz/do_not_run_or_the_pack_may_break'
	})
);

export default getInternalChild;