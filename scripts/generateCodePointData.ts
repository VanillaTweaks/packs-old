import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import type { Image } from 'canvas';
import { createCanvas, loadImage } from 'canvas';

type BitmapFontProvider = {
	type: 'bitmap',
	file: string,
	height?: number,
	ascent: number,
	chars: string[]
};

type LegacyUnicodeFontProvider = {
	type: 'legacy_unicode',
	sizes: string,
	template: string
};

type TTFFontProvider = {
	type: 'ttf',
	file: string,
	shift: [number, number],
	size: number,
	oversample: number,
	skip: string | string[]
};

type FontProvider = BitmapFontProvider | LegacyUnicodeFontProvider | TTFFontProvider;

type Font = {
	providers: FontProvider[]
};

const MIN_HIGH_SURROGATE_CHAR_CODE = 0xd800;
const MAX_LOW_SURROGATE_CHAR_CODE = 0xdfff;

/** The width of the space between glyphs in in-game pixels. */
const KERNING_WIDTH = 1;
/** The default height of a bitmap font glyph in in-game pixels. */
const DEFAULT_GLYPH_HEIGHT = 8;

console.log('Generating...');

const minecraftAssets = axios.create({
	baseURL: 'https://raw.githubusercontent.com/misode/mcmeta/assets/assets/minecraft',
	timeout: 10000
});

minecraftAssets.get<Font>('/font/default.json').then(async ({ data: font }) => {
	/** A mapping from each code point to its in-game width. */
	const codePointWidths: Record<string, number> = {
		// The width of a space is constant and not determined by font data.
		' ': 4
	};
	/** A mapping from each legacy unicode code point to its in-game width. */
	const legacyUnicodeCodePointWidths: Record<string, number> = {};

	// Fetch all the data.
	let legacyUnicodeFontData: Buffer | undefined;
	const bitmapFontData = (
		await Promise.all(
			font.providers.map(async provider => {
				if (provider.type === 'bitmap') {
					const { data: buffer } = await minecraftAssets.get<Buffer>(
						`/textures/${provider.file.split(':')[1]}`,
						{ responseType: 'arraybuffer' }
					);

					const image = await loadImage(buffer);

					return { provider, image };
				} else if (provider.type === 'legacy_unicode') {
					({ data: legacyUnicodeFontData } = await minecraftAssets.get<Buffer>(
						`/${provider.sizes.split(':')[1]}`,
						{ responseType: 'arraybuffer' }
					));
				}
			})
		)
	).filter((data): data is NonNullable<typeof data> => data !== undefined);

	// Get the widths of bitmap code points.
	for (const { provider, image } of bitmapFontData) {
		const canvas = createCanvas(image.width, image.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(image, 0, 0);
		const imageData = ctx.getImageData(0, 0, image.width, image.height).data;

		const getAlpha = (x: number, y: number) => (
			imageData[4 * (y * image.width + x) + 3]
		);

		const rowCount = provider.chars.length;
		const columnCount = [...provider.chars[0]].length;

		const rowHeight = Math.floor(image.height / rowCount);
		const columnWidth = Math.floor(image.width / columnCount);

		const glyphHeight = provider.height ?? DEFAULT_GLYPH_HEIGHT;
		const glyphScale = glyphHeight / rowHeight;

		for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
			const row = [...provider.chars[rowIndex]];

			for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
				const codePoint = row[columnIndex];

				if (codePoint === '\u0000' || codePoint === ' ') {
					// Null characters and spaces should be skipped because the game ignores them.
					continue;
				}

				const glyphX = columnIndex * columnWidth;
				const glyphY = rowIndex * rowHeight;

				let xOffset;
				scanningGlyph:
				for (xOffset = columnWidth - 1; xOffset >= 0; xOffset--) {
					const x = glyphX + xOffset;
					for (let yOffset = 0; yOffset < rowHeight; yOffset++) {
						const y = glyphY + yOffset;

						if (getAlpha(x, y)) {
							break scanningGlyph;
						}
					}
				}

				// At this point, `xOffset` is the index of the first non-empty column of pixels from the right within the glyph.
				// Note: `xOffset` would be -1 if the glyph is completely empty.
				const glyphWidth = xOffset + 1;

				// For negative `glyphScale`s, it makes no sense to add 0.5 and then truncate as opposed to only rounding, but it's straight from the game's code, so we're going with it.
				const codePointWidth = Math.trunc(glyphWidth * glyphScale + 0.5) + KERNING_WIDTH;
				codePointWidths[codePoint] = codePointWidth;
			}
		}
	}

	// Get the widths of legacy unicode characters.
	if (legacyUnicodeFontData) {
		for (let i = 0; i <= 0xffff; i++) {
			if (i === MIN_HIGH_SURROGATE_CHAR_CODE) {
				// Skip past the surrogate characters.
				i = MAX_LOW_SURROGATE_CHAR_CODE;
				continue;
			}

			const char = String.fromCharCode(i);

			if (char in codePointWidths) {
				// Skip characters which have already been covered by non-legacy-unicode font providers.
				continue;
			}

			const charSizeData = legacyUnicodeFontData[i];
			const charStart = charSizeData >> 4;
			const charEnd = (charSizeData & 0xf) + 1;

			const charWidth = Math.floor((charEnd - charStart) / 2) + KERNING_WIDTH;
			legacyUnicodeCodePointWidths[char] = charWidth;
		}
	}

	// Write the data.
	const cwd = process.cwd();
	await Promise.all([
		fs.writeFile(
			path.join(cwd, 'lib/datapacks/textComponents/getWidth/codePointWidths.json'),
			JSON.stringify(codePointWidths)
		),
		fs.writeFile(
			path.join(cwd, 'lib/datapacks/textComponents/getWidth/legacyUnicodeCodePointWidths.json'),
			JSON.stringify(legacyUnicodeCodePointWidths)
		)
	]);

	console.log('Done!');
});