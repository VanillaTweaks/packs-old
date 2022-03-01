import PropertyBoundary from 'lib/datapacks/textComponents/minify/factorCommonProperties/PropertyBoundary';
import type { HeritableKey } from 'lib/datapacks/textComponents/heritableKeys';
import PropertyEnd from 'lib/datapacks/textComponents/minify/factorCommonProperties/PropertyEnd';
import type { PropertyString } from 'lib/datapacks/textComponents/minify/factorCommonProperties/getPropertyString';
import getPropertyString from 'lib/datapacks/textComponents/minify/factorCommonProperties/getPropertyString';

export default class PropertyStart extends PropertyBoundary {
	readonly key: HeritableKey;
	/** This property's value passed through `JSON.stringify`. */
	readonly value: string;

	/** A string that both uniquely identifies a property and represents the number of characters which a single instance of that property generally requires via its length. */
	readonly string: PropertyString;
	/** The typical number of characters required by a single instance of this property. */
	readonly size: number;

	/** The `PropertyEnd` which this marks the start of. */
	readonly end = new PropertyEnd(this);

	/** Marks the start of a series of consecutive subcomponents which are unaffected by a property. */
	constructor(
		key: PropertyStart['key'],
		value: unknown
	) {
		super();

		this.key = key;
		this.value = JSON.stringify(value);

		this.string = getPropertyString(key, value);
		this.size = this.string.length;
	}

	/** An ordered array of subcomponent indexes within these property boundaries at which this property is present. */
	occurrences: number[] = [];

	/** The approximate total number of the characters required by this property throughout all adjacent subcomponents. */
	get cost() {
		return this.occurrences.length * this.size;
	}

	/** Checks whether this property is equivalent to another. */
	equals(...[key, value]: ConstructorParameters<typeof PropertyStart>) {
		return this.string === getPropertyString(key, value);
	}
}