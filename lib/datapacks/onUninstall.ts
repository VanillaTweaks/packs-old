import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';
import pack from 'lib/datapacks/pack';
import { MCFunction } from 'sandstone';
import uninstallTag from 'lib/datapacks/uninstallTag';
import internalBasePath from 'lib/datapacks/internalBasePath';
import { setHasUninstallFunction } from 'lib/datapacks/setMetaAdvancements';

/** Adds to a `BasePath`'s uninstall function. */
const onUninstall = (
	basePath: VTBasePathInstance,
	callback: () => void
) => {
	let uninstallFunctionName;

	if (basePath.namespace === pack.namespace) {
		setHasUninstallFunction(true);

		uninstallFunctionName = basePath`uninstall`;
	} else {
		const basePath_ = internalBasePath(basePath);

		// If this uninstall function is for a `BasePath` other than `pack`, then it should not be publicly accessible, because that would allow people to run it despite other packs still depending on the `BasePath` being fully installed and running.
		uninstallFunctionName = basePath_`uninstall`;
	}

	const uninstallFunction = MCFunction(uninstallFunctionName, callback, {
		onConflict: 'append'
	});

	// TODO: Use `!uninstallTag.has(uninstallFunction)` instead.
	if (!uninstallTag.values.some(value => value.toString() === uninstallFunction.toString())) {
		uninstallTag.add(uninstallFunction);
	}
};

export default onUninstall;