/** The base number for all Vanilla Tweaks `CustomModelData` values. */
const CUSTOM_MODEL_DATA_BASE = 880000;

/**
 * Gets an absolute `CustomModelData` value from a value from 0 to 9999.
 *
 * Example:
 *
 * ```ts
 * customModelData(3)
 * === 880000 + 3
 * === 880003
 * ```
 */
const customModelData = (value: number) => {
	if (!Number.isInteger(value) || value < 0 || value > 9999) {
		throw new TypeError('The `CustomModelData` value must be an integer from 0 to 9999.');
	}

	return CUSTOM_MODEL_DATA_BASE + value;
};

export default customModelData;