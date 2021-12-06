import pack from 'lib/datapacks/pack';
import { BasePath, scoreboard } from 'sandstone';
import getInternalChild from 'lib/datapacks/getInternalChild';
import type { RootVTBasePath } from 'lib/datapacks/VTBasePath';
import { withVT } from 'lib/datapacks/VTBasePath';

/** Properties only assigned to the `BasePath` for the VT namespace. */
const vtProperties = {
	temp: {
		toString: () => {
			pack.onLoad(() => {
				scoreboard.objectives.add(VT.pre`temp`, 'dummy');
			}, 'prepend');

			VT.onUninstall(() => {
				scoreboard.objectives.remove(VT.pre`temp`);
			}, 'append');

			return VT.pre`temp`;
		},
		get length() {
			return vtProperties.temp.toString().length;
		}
	} as string
} as {
	/**
	 * When stringified, evaluates to `'vanillatweaks.temp'`, the name of the VT temp scoreboard objective, and creates that objective if it has not already been created.
	 *
	 * For scoreboard objective names, this should always be used instead of `VT.pre` or `'vanillatweaks.temp'`.
	 */
	temp: string
};

/** The `BasePath` for the Vanilla Tweaks namespace. */
export const VT: RootVTBasePath & typeof vtProperties = Object.assign(
	withVT(
		BasePath({
			namespace: 'vanillatweaks',
			onConflict: {
				// This is so a library functions that create resources (e.g. `execute...run(...)` creating an `MCFunction`) don't try to create them multiple times when called multiple times.
				default: 'ignore'
			}
		})
	),
	vtProperties
);

/**
 * A child `BasePath` of `VT` whose directory is named to discourage users from running functions and function tags created in it.
 *
 * Every `MCFunction` or `Tag<'functions'>` should always be created under this unless there is intent for it to be run freely by users.
 */
export const VT_ = getInternalChild(VT);