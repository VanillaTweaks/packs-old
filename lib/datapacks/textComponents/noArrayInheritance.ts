import type { JSONTextComponent } from 'sandstone';
import { ComponentClass } from 'sandstone/variables';

/** Recursively inserts `''` to the beginning of every array to prevent array inheritance. */
const noArrayInheritance = (component: JSONTextComponent): JSONTextComponent => {
	if (typeof component === 'object') {
		if (Array.isArray(component)) {
			return ['', component.map(noArrayInheritance)];
		}

		if (component instanceof ComponentClass) {
			// We don't want to potentially disable intentional inheritance in a `ComponentClass`.
			return component;
		}

		if (component.extra) {
			component = {
				...component,
				extra: component.extra.map(noArrayInheritance)
			};
		}

		type ComponentPossiblyWithWith = Extract<typeof component, { with?: any }>;
		if ((component as ComponentPossiblyWithWith).with) {
			component = {
				...component,
				// TODO: Remove `as any`.
				with: (component as ComponentPossiblyWithWith).with!.map(noArrayInheritance) as any
			};
		}
	}

	return component;
};

export default noArrayInheritance;