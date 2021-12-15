import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import pack from 'lib/datapacks/pack';
import state from 'lib/datapacks/state';
import VT from 'lib/datapacks/VT';
import { MCFunction, Tag } from 'sandstone';

export const uninstallTag = Tag('functions', VT`uninstall`);

/** Adds code to a `BasePath`'s uninstall function. */
const onUninstall = (
	basePath: VTBasePathInstance,
	callback: () => void
) => {
	if (basePath.namespace === pack.namespace) {
		state.hasUninstallFunction = true;
	}

	const uninstallFunction = MCFunction(basePath`uninstall`, callback, {
		onConflict: 'append'
	});

	// TODO: Use `!uninstallTag.has(uninstallFunction)` instead.
	if (!uninstallTag.values.some(value => value.toString() === uninstallFunction.toString())) {
		uninstallTag.add(uninstallFunction);
	}
};

export default onUninstall;