import type { FlatJSONTextComponent } from 'lib/datapacks/textComponents/flatten';
import type { JSONTextComponent } from 'sandstone';
import type { IsAffectedByInheritingOptions } from 'lib/datapacks/textComponents/minify/isAffectedByInheriting';
import getHeritableKeys from 'lib/datapacks/textComponents/getHeritableKeys';
import isAffectedByInheriting from 'lib/datapacks/textComponents/minify/isAffectedByInheriting';

/** Checks whether a specified `FlatJSONTextComponent` inheriting the specified properties from another `JSONTextComponent` has a distinguishable in-game effect on the component. */
const isAffectedByInheritingFrom = (
	component: FlatJSONTextComponent,
	inheritedComponent: JSONTextComponent,
	options: IsAffectedByInheritingOptions = {}
) => (
	isAffectedByInheriting(
		component,
		getHeritableKeys(inheritedComponent),
		options
	)
);

export default isAffectedByInheritingFrom;