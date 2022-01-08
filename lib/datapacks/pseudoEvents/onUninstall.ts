import type { ResourceLocationInstance } from 'lib/datapacks/ResourceLocation';
import pack from 'lib/datapacks/pack';
import { Tag, MCFunction, functionCmd } from 'sandstone';
import vt from 'lib/datapacks/vt';
import { setHasUninstallFunction } from 'lib/datapacks/setMetaAdvancements';

const uninstallTag = Tag('functions', vt`_uninstall`);

MCFunction(vt`uninstall`, () => {
	// TODO: Use `uninstallTag()` instead.
	functionCmd(uninstallTag);
});

/** Adds to a `ResourceLocation`'s uninstall function. */
const onUninstall = (
	resourceLocation: ResourceLocationInstance,
	callback: () => void
) => {
	let uninstallFunctionName;

	if (resourceLocation === pack) {
		setHasUninstallFunction(true);

		uninstallFunctionName = resourceLocation`uninstall`;
	} else {
		// If this uninstall function is for a `ResourceLocation` other than `pack`, then it should not be publicly accessible, because that would allow people to run it despite other packs still depending on the `ResourceLocation` being fully installed and running.
		uninstallFunctionName = resourceLocation`_uninstall`;
	}

	const uninstallFunction = MCFunction(uninstallFunctionName, callback, {
		// Prepend instead of append so things are uninstalled in the reverse order that they are installed.
		onConflict: 'prepend'
	});

	// TODO: Use `!uninstallTag.has(uninstallFunction)` instead.
	if (!uninstallTag.values.some(value => value.toString() === uninstallFunction.toString())) {
		// Prepend here for the same reason we use `onConflict: 'prepend'` on the `uninstallFunction`.
		// TODO: Remove `as any`.
		uninstallTag.values.unshift(uninstallFunction as any);
	}
};

export default onUninstall;