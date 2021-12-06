import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import pack from 'lib/datapacks/pack';
import state from 'lib/datapacks/state';
import VT from 'lib/datapacks/VT';

/** Adds code to a `BasePath`'s uninstall function. */
const onUninstall = (
	basePath: VTBasePathInstance,
	callback: () => void,
	onConflict: 'append' | 'prepend' = 'prepend'
) => {
	if (basePath.namespace === pack.namespace) {
		state.hasUninstallFunction = true;
	}

	basePath.MCFunction('uninstall', callback, {
		tags: [VT.Tag('functions', 'uninstall')],
		onConflict
	});
};

export default onUninstall;