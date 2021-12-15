import { Tag, MCFunction, functionCmd } from 'sandstone';
import VT, { VT_ } from 'lib/datapacks/VT';

/** The `` VT_`uninstall` `` function tag, which is called from the `` VT`uninstall` `` function. */
const uninstallTag = Tag('functions', VT_`uninstall`);

export default uninstallTag;

MCFunction(VT`uninstall`, () => {
	// TODO: Use `uninstallTag()` instead.
	functionCmd(uninstallTag);
});