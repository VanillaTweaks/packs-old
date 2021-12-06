// Provides the `BasePath`s for the data pack.

import * as meta from 'lib/meta';
import { BasePath } from 'sandstone';
import getInternalChild from 'lib/datapacks/getInternalChild';
import type { RootVTBasePath } from 'lib/datapacks/VTBasePath';
import { withVT } from 'lib/datapacks/VTBasePath';

/** The `BasePath` for the pack namespace. */
const pack: RootVTBasePath & typeof meta = Object.assign(
	withVT(
		BasePath({ namespace: meta.namespace })
	),
	meta
);

export default pack;

/**
 * A child `BasePath` of `pack` whose directory is named to discourage users from running functions and function tags created in it.
 *
 * Every `MCFunction` or `Tag<'functions'>` should always be created under this unless there is intent for it to be run freely by users.
 */
export const pack_ = getInternalChild(pack);