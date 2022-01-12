import type { JSONTextComponent } from 'sandstone';
import { ComponentClass } from 'sandstone/variables';

/** Recursively transforms every raw array in the specified component to have `''` as its first element, preventing other elements in the array from inheriting anything from it. */
const disableArrayInheritance = (component: JSONTextComponent): JSONTextComponent => {
	if (typeof component === 'object') {
		if (Array.isArray(component)) {
			return ['', component.map(disableArrayInheritance)];
		}

		if (component instanceof ComponentClass) {
			// We don't want to potentially disable intentional inheritance in a `ComponentClass`.
			return component;
		}

		if ('extra' in component) {
			return {
				...component,
				extra: component.extra?.map(disableArrayInheritance)
			};
		}

		if ('with' in component) {
			return {
				...component,
				// TODO: Remove `as any`.
				with: component.with?.map(disableArrayInheritance) as any
			};
		}
	}

	return component;
};

export default disableArrayInheritance;