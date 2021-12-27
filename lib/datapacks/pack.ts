// Provides the `BasePath`s for the data pack.

import * as meta from 'lib/meta';
import internalBasePath from 'lib/datapacks/internalBasePath';
import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import VTBasePath from 'lib/datapacks/VTBasePath';

/** The `BasePath` for the pack namespace. */
const pack: VTBasePathInstance & typeof meta = Object.assign(
	VTBasePath({ namespace: meta.namespace }),
	meta
);

export default pack;

/**
 * A child `BasePath` of `pack` whose directory is named to discourage users from running functions and function tags created in it.
 *
 * Every `MCFunction` or `Tag<'functions'>` should always be created under this instead of `pack` unless there is intent for it to be run freely by users.
 */
export const pack_ = internalBasePath(pack);