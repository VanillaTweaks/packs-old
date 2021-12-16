import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import { posix as path } from 'path';
import { BasePath } from 'sandstone';

const INTERNAL_BASE_PATH_DIRECTORY = 'zz/do_not_run_or_the_pack_may_break';

export type InternalBasePath = Omit<VTBasePathInstance, 'child'> & {
	/** ⚠️ Use `internalBasePath(basePath.child(...))` instead of `internalBasePath(basePath).child(...)`. */
	child: undefined
};

/**
 * Returns a child of the specified `BasePath` whose directory is named to discourage users from running functions and function tags created in it.
 *
 * Every `MCFunction` or `Tag<'functions'>` should always be created under a `internalBasePath(basePath)` instead of a `basePath` unless there is intent for it to be run freely by users.
 *
 * ⚠️ Please use `basePath_` instead of `internalBasePath(basePath)` wherever possible. Ideally, this function should only ever be called once per `BasePath`.
 */
const internalBasePath = (basePath: VTBasePathInstance): InternalBasePath => (
	Object.assign(
		BasePath({
			namespace: basePath.namespace,
			directory: (
				basePath.directory
					? path.join(INTERNAL_BASE_PATH_DIRECTORY, basePath.directory)
					: INTERNAL_BASE_PATH_DIRECTORY
			)
		}),
		{ child: undefined }
	)
);

export default internalBasePath;