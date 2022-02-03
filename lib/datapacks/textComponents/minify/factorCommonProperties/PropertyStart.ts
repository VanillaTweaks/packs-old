import PropertyBoundary from 'lib/datapacks/textComponents/minify/factorCommonProperties/PropertyBoundary';
import type { HeritableKey } from 'lib/datapacks/textComponents/heritableKeys';
import type PropertyEnd from 'lib/datapacks/textComponents/minify/factorCommonProperties/PropertyEnd';

/**
 * Marks the start of a series of consecutive subcomponents which are unaffected by a property.
 *
 * The subcomponent immediately after an instance of this must either
 * * have the property, or
 * * be unaffected by the property and be immediately before a subcomponent which has the property.
 */
export default class PropertyStart extends PropertyBoundary {
	readonly key: HeritableKey;
	/** This property's value passed through `JSON.stringify`. */
	readonly value: string;

	/** A string that both uniquely identifies a property and represents the number of characters which a single instance of that property generally requires via its length. */
	private readonly string: `,"${string}":${string}`;

	/** The typical number of characters required by a single instance of this property. */
	readonly length: number;
	/** The number of adjacent subcomponents which have this property. */
	quantity = 0;

	/** The `PropertyEnd` which this marks the start of. */
	end?: PropertyEnd;

	constructor(
		key: PropertyStart['key'],
		value: unknown
	) {
		super();

		this.key = key;
		this.value = JSON.stringify(value);

		this.string = `,"${key}":${this.value}`;
		this.length = this.string.length;
	}

	/** Checks whether this property is equivalent to another. */
	equals(...[key, value]: ConstructorParameters<typeof PropertyStart>) {
		const string = `,"${key}":${JSON.stringify(value)}`;

		return this.string === string;
	}
}