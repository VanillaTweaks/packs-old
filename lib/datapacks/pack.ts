import internalBasePath from 'lib/datapacks/internalBasePath';
import VTBasePath from 'lib/datapacks/VTBasePath';
import { title, namespace, version } from 'lib/meta';

/** The `BasePath` for the data pack's namespace. */
const pack = VTBasePath({ namespace, title, version });

export default pack;

/**
 * A child `BasePath` of `pack` whose directory is named to discourage users from running functions and function tags created in it.
 *
 * Every `MCFunction` or `Tag<'functions'>` should always be created under this instead of `pack` unless there is intent for it to be run freely by users.
 */
export const pack_ = internalBasePath(pack);