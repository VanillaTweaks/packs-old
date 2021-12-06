/** Various mutable properties shared between different parts of the project. */
const state = {
	/** An array of functions called after the rest of the pack's processing, before the pack is saved. */
	finishFunctions: [] as Array<() => void>,
	hasUninstallFunction: false,
	hasConfigFunction: false
};

export default state;