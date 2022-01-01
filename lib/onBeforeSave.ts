/**
 * An array of functions called after the rest of the pack's processing, before the pack is saved.
 *
 * ⚠️ Should only ever be imported from `sandstone.config`.
 */
export const beforeSaveCallbacks: Array<() => void | Promise<void>> = [];

/** Queues a function to be called (and awaited) after the rest of the pack's processing, before the pack is saved. */
const onBeforeSave = (callback: () => void | Promise<void>) => {
	beforeSaveCallbacks.push(callback);
};

export default onBeforeSave;