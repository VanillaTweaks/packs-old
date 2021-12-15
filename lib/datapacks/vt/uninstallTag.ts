import { Tag, MCFunction, functionCmd } from 'sandstone';
import vt, { vt_ } from 'lib/datapacks/vt';

/** The `` vt_`uninstall` `` function tag, which is called from the `` vt`uninstall` `` function. */
const uninstallTag = Tag('functions', vt_`uninstall`);

export default uninstallTag;

MCFunction(vt`uninstall`, () => {
	// TODO: Use `uninstallTag()` instead.
	functionCmd(uninstallTag);
});