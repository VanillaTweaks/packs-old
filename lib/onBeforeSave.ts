/** An array of functions called after the rest of the pack's processing, before the pack is saved. */
export const beforeSaveListeners: Array<() => void | Promise<void>> = [];

/** Queues a function to be called (and awaited) after the rest of the pack's processing, before the pack is saved. */
const onBeforeSave = (callback: () => void | Promise<void>) => {
	beforeSaveListeners.push(callback);
};

export default onBeforeSave;