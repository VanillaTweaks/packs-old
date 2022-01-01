type PromiseOrFunction = (
	Promise<void> | (() => void | Promise<void>)
);

/**
 * An array of promises and functions to call and/or await after the rest of the pack's processing, before the pack is saved.
 *
 * ⚠️ Should only ever be imported from `sandstone.config`.
 */
export const promisesAndFunctionsBeforeSave: PromiseOrFunction[] = [];

/** Queues a promise to be awaited or a function to be called and awaited after the rest of the pack's processing, before the pack is saved. */
const beforeSave = (promiseOrFunction: PromiseOrFunction) => {
	promisesAndFunctionsBeforeSave.push(promiseOrFunction);
};

export default beforeSave;