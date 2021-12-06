import type { RootVTBasePath } from 'lib/datapacks/withVT';
import getInternalChild from 'lib/datapacks/getInternalChild';

/** Adds code to a `BasePath`'s load function. */
const onLoad = <
	ReturnValue extends void | Promise<void> = void | Promise<void>
>(
	basePath: RootVTBasePath,
	callback: () => ReturnValue,
	onConflict: 'append' | 'prepend' = 'append'
) => {
	getInternalChild(basePath).MCFunction('load', callback, {
		runOnLoad: true,
		onConflict
	});
};

export default onLoad;