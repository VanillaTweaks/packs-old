import type { AdvancementInstance } from 'sandstone';
import { advancement } from 'sandstone';
import onPlayerJoinOrLoad from 'lib/datapacks/onPlayerLoadOrJoin';
import type { VTBasePathInstance } from 'lib/datapacks/VTBasePath';

/**
 * Revokes the specified advancement from any player that joins and from `@a` on load.
 *
 * If not for this, a player could keep the advancement forever if they were granted it while the `function-permission-level` was too low for its reward function to revoke it, leading the advancement to never trigger for that player again.
 */
const revokeOnPlayerLoadOrJoin = (
	/** The `BasePath` under which to create the function that revokes the advancement. */
	basePath: VTBasePathInstance,
	advancementToRevoke: AdvancementInstance
) => {
	onPlayerJoinOrLoad(basePath, () => {
		advancement.revoke('@s').only(advancementToRevoke);
	});
};

export default revokeOnPlayerLoadOrJoin;