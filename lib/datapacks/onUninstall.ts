import type { RootVTBasePath } from 'lib/datapacks/withVT';
import pack from 'lib/datapacks/pack';
import state from 'lib/datapacks/state';
import VT from 'lib/datapacks/VT';

/** Adds code to a `BasePath`'s uninstall function. */
const onUninstall = <
	ReturnValue extends void | Promise<void> = void | Promise<void>
>(
	basePath: RootVTBasePath,
	callback: () => ReturnValue,
	onConflict: 'append' | 'prepend' = 'prepend'
) => {
	if (basePath.namespace === pack.namespace) {
		state.hasUninstallFunction = true;
	}

	return basePath.MCFunction('uninstall', callback, {
		tags: [VT.Tag('functions', 'uninstall')],
		onConflict
	});
};

export default onUninstall;