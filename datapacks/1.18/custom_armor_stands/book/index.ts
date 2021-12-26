import pack from 'lib/datapacks/pack';
import center from 'lib/datapacks/textComponents/center';
import columns from 'lib/datapacks/textComponents/columns';
import minify from 'lib/datapacks/textComponents/minify';
import overlap from 'lib/datapacks/textComponents/overlap';
import right from 'lib/datapacks/textComponents/right';
import { LootTable, NBT } from 'sandstone';

const FIRST_PAGE_LINK_COLOR = 'dark_gray';
const PAGE_TITLE_COLOR = 'black';
const DETAILS_COLOR = 'gray';
const INFO_COLOR = '#aa0079';
const HEADING_COLOR = 'black';
const CLICKABLE_COLOR = '#b26c34';
const CLICKABLE_COLOR_2 = '#a2462a';
const NUMBER_COLOR = 'dark_green';
const NEGATIVE_NUMBER_COLOR = '#e64c4c';
const POSITIVE_NUMBER_COLOR = 'dark_green';

const book = LootTable(pack`book`, {
	type: 'minecraft:command',
	pools: [{
		rolls: 1,
		entries: [{
			type: 'minecraft:item',
			name: 'minecraft:written_book',
			functions: [{
				// TODO: Remove type assertion.
				function: 'minecraft:set_nbt' as 'set_nbt',
				tag: NBT.stringify({
					title: 'Custom Armor Stands',
					author: 'Vanilla Tweaks',
					display: {
						Name: JSON.stringify(
							{ text: 'Custom Armor Stands', color: 'gold', italic: false }
						)
					},
					pages: [
						[
							center([
								{ text: 'Custom Armor Stands', color: PAGE_TITLE_COLOR },
								'\n\n',
								{ text: 'To proceed, first\nselect the armor\nstand you want to\ncustomize.', color: DETAILS_COLOR },
								'\n\n',
								{ text: 'Select', color: HEADING_COLOR },
								'\n',
								{ text: 'Nearest Armor Stand', color: CLICKABLE_COLOR },
								'\n',
								{ text: 'Use Mouse', color: CLICKABLE_COLOR }
							])
						],
						[
							center([
								{ text: 'Custom Armor Stands', color: PAGE_TITLE_COLOR },
								'\n',
								{ text: '⤺', color: CLICKABLE_COLOR, bold: true },
								' ',
								{ text: '⟳', color: CLICKABLE_COLOR, bold: true },
								' ',
								{ text: '⤻', color: CLICKABLE_COLOR, bold: true },
								'\n\n',
								{ text: 'Manage Selection', color: CLICKABLE_COLOR }
							]),
							'\n\n',
							columns([
								{ text: 'Properties', color: CLICKABLE_COLOR_2 },
								'\n',
								{ text: 'Clipboard', color: CLICKABLE_COLOR_2 },
								'\n',
								{ text: 'Position', color: CLICKABLE_COLOR_2 }
							], [
								{ text: 'Presets', color: CLICKABLE_COLOR_2 },
								'\n',
								{ text: 'Slots', color: CLICKABLE_COLOR_2 },
								'\n',
								{ text: 'Rotation', color: CLICKABLE_COLOR_2 }
							]),
							'\n\n',
							columns([
								{ text: 'Head', color: CLICKABLE_COLOR_2 },
								'\n',
								{ text: 'Left Arm', color: CLICKABLE_COLOR_2 },
								'\n',
								{ text: 'Left Leg', color: CLICKABLE_COLOR_2 }
							], [
								{ text: 'Body', color: CLICKABLE_COLOR_2 },
								'\n',
								{ text: 'Right Arm', color: CLICKABLE_COLOR_2 },
								'\n',
								{ text: 'Right Leg', color: CLICKABLE_COLOR_2 }
							])
						], [
							overlap(
								{ text: '⏪', color: FIRST_PAGE_LINK_COLOR },
								center(
									{ text: 'Manage Selection', color: PAGE_TITLE_COLOR }
								),
								right(
									{ text: 'ℹ', color: INFO_COLOR }
								)
							),
							'\n\n',
							center([
								{ text: 'Highlight Selected', color: CLICKABLE_COLOR },
								'\n',
								{ text: 'Deselect', color: CLICKABLE_COLOR },
								'\n\n',
								{ text: 'Select', color: HEADING_COLOR },
								'\n',
								{ text: 'Nearest Armor Stand', color: CLICKABLE_COLOR },
								'\n',
								{ text: 'Use Mouse', color: CLICKABLE_COLOR }
							])
						], [
							overlap(
								{ text: '⏪', color: FIRST_PAGE_LINK_COLOR },
								center(
									{ text: 'Properties', color: PAGE_TITLE_COLOR }
								),
								right(
									{ text: 'ℹ', color: INFO_COLOR }
								)
							),
							'\n\n',
							{ text: '[ ✔ ]', color: 'dark_green' },
							{ text: ' Base Plate\n', color: 'dark_gray' },
							{ text: '[ ✔ ]', color: 'dark_green' },
							{ text: ' Gravity \n', color: 'dark_gray' },
							{ text: '[ ❌ ]', color: 'red' },
							{ text: ' Invisible\n', color: 'dark_gray' },
							{ text: '[ ❌ ]', color: 'red' },
							{ text: ' Invulnerable\n', color: 'dark_gray' },
							{ text: '[ ❌ ]', color: 'red' },
							{ text: ' Lock Slots\n', color: 'dark_gray' },
							{ text: '[ ❌ ]', color: 'red' },
							{ text: ' Marker\n', color: 'dark_gray' },
							{ text: '[ ❌ ]', color: 'red' },
							{ text: ' Show Arms\n', color: 'dark_gray' },
							{ text: '[ ❌ ]', color: 'red' },
							{ text: ' Show Name Tag\n', color: 'dark_gray' },
							{ text: '[ ❌ ]', color: 'red' },
							{ text: ' Small\n', color: 'dark_gray' },
							{ text: '[ ❌ ]', color: 'red' },
							{ text: ' Visual Fire', color: 'dark_gray' }
						], [
							overlap(
								{ text: '⏪', color: FIRST_PAGE_LINK_COLOR },
								center(
									{ text: 'Clipboard', color: PAGE_TITLE_COLOR }
								),
								right(
									{ text: 'ℹ', color: INFO_COLOR }
								)
							),
							'\n',
							center([
								{ text: 'Reset', color: CLICKABLE_COLOR },
								'\n\n',
								{ text: 'Copy', color: HEADING_COLOR },
								'\n',
								{ text: 'Properties and Poses', color: CLICKABLE_COLOR },
								'\n',
								{ text: 'Only Properties', color: CLICKABLE_COLOR },
								'\n',
								{ text: 'Only Poses', color: CLICKABLE_COLOR },
								'\n',
								{ text: 'Record New Macro', color: CLICKABLE_COLOR },
								'\n\n',
								{ text: 'Paste', color: HEADING_COLOR },
								'\n',
								{ text: 'Clipboard Data', color: CLICKABLE_COLOR }
							])
						], [
							overlap(
								{ text: '⏪', color: FIRST_PAGE_LINK_COLOR },
								center(
									{ text: 'Slots', color: PAGE_TITLE_COLOR }
								),
								right(
									{ text: 'ℹ', color: INFO_COLOR }
								)
							),
							'\n\n',
							center([
								{ text: 'Swap Main Hand With', color: HEADING_COLOR },
								'\n',
								{ text: 'Off-Hand', color: CLICKABLE_COLOR },
								'\n',
								{ text: 'Helmet', color: CLICKABLE_COLOR },
								'\n',
								{ text: 'Chestplate', color: CLICKABLE_COLOR },
								'\n',
								{ text: 'Leggings', color: CLICKABLE_COLOR },
								'\n',
								{ text: 'Boots', color: CLICKABLE_COLOR }
							])
						], [
							overlap(
								{ text: '⏪', color: FIRST_PAGE_LINK_COLOR },
								center(
									{ text: 'Position', color: PAGE_TITLE_COLOR }
								),
								right(
									{ text: 'ℹ', color: INFO_COLOR }
								)
							),
							'\n',
							center([
								{ text: 'Use Mouse', color: CLICKABLE_COLOR },
								'\n\n',
								{ text: 'Left/Right', color: HEADING_COLOR }
							]),
							'\n',
							columns([
								{ text: '-8', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-4', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-1', color: NEGATIVE_NUMBER_COLOR }
							], [
								{ text: '+1', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+4', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+8', color: POSITIVE_NUMBER_COLOR }
							]),
							'\n',
							columns(
								{ text: 'Use Mouse', color: CLICKABLE_COLOR },
								{ text: 'Center', color: CLICKABLE_COLOR }
							),
							'\n\n',
							center([
								{ text: 'Down/Up', color: HEADING_COLOR }
							]),
							'\n',
							columns([
								{ text: '-8', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-4', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-1', color: NEGATIVE_NUMBER_COLOR }
							], [
								{ text: '+1', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+4', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+8', color: POSITIVE_NUMBER_COLOR }
							]),
							'\n',
							columns(
								{ text: 'Use Mouse', color: CLICKABLE_COLOR },
								{ text: 'Snap', color: CLICKABLE_COLOR }
							),
							'\n\n',
							center(
								{ text: 'Back/Forward', color: HEADING_COLOR }
							),
							'\n',
							columns([
								{ text: '-8', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-4', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-1', color: NEGATIVE_NUMBER_COLOR }
							], [
								{ text: '+1', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+4', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+8', color: POSITIVE_NUMBER_COLOR }
							]),
							'\n',
							columns(
								{ text: 'Use Mouse', color: CLICKABLE_COLOR },
								{ text: 'Center', color: CLICKABLE_COLOR }
							)
						], [
							overlap(
								{ text: '⏪', color: FIRST_PAGE_LINK_COLOR },
								center(
									{ text: 'Rotation', color: PAGE_TITLE_COLOR }
								),
								right(
									{ text: 'ℹ', color: INFO_COLOR }
								)
							),
							'\n',
							center([
								{ text: 'Flip Horizontally', color: CLICKABLE_COLOR },
								'\n\n',
								{ text: 'Rotate Left/Right', color: HEADING_COLOR },
								'\n',
								{ text: '-1', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-5', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-15', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-22.5', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-90', color: NEGATIVE_NUMBER_COLOR },
								'\n',
								{ text: '+1', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+5', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+15', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+22.5', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+90', color: POSITIVE_NUMBER_COLOR },
								'\n',
								{ text: 'Use Mouse', color: CLICKABLE_COLOR },
								'\n\n',
								{ text: 'Snap to Multiple of', color: HEADING_COLOR },
								'\n',
								{ text: '5', color: NUMBER_COLOR },
								' ',
								{ text: '15', color: NUMBER_COLOR },
								' ',
								{ text: '22.5', color: NUMBER_COLOR },
								' ',
								{ text: '45', color: NUMBER_COLOR },
								' ',
								{ text: '90', color: NUMBER_COLOR },
								'\n\n',
								{ text: 'Set Rotation', color: HEADING_COLOR },
								'\n',
								{ text: 'Toward You', color: CLICKABLE_COLOR },
								'\n',
								{ text: 'Away From You', color: CLICKABLE_COLOR }
							])
						], [
							overlap(
								{ text: '⏪', color: FIRST_PAGE_LINK_COLOR },
								center([
									{ text: 'Head', color: PAGE_TITLE_COLOR },
									' ',
									{ text: '(1 of 2)', color: DETAILS_COLOR }
								]),
								right(
									{ text: 'ℹ', color: INFO_COLOR }
								)
							),
							'\n',
							columns(
								{ text: 'Use Mouse', color: CLICKABLE_COLOR },
								{ text: 'Reset', color: CLICKABLE_COLOR }
							),
							'\n\n',
							center([
								{ text: 'X Rotation', color: HEADING_COLOR },
								'\n',
								{ text: '-1', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-5', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-15', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-22.5', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-90', color: NEGATIVE_NUMBER_COLOR },
								'\n',
								{ text: '+1', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+5', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+15', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+22.5', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+90', color: POSITIVE_NUMBER_COLOR }
							]),
							'\n',
							columns(
								{ text: 'Use Mouse', color: CLICKABLE_COLOR },
								{ text: 'Reset', color: CLICKABLE_COLOR }
							),
							'\n\n',
							center([
								{ text: 'Y Rotation', color: HEADING_COLOR },
								'\n',
								{ text: '-1', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-5', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-15', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-22.5', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-90', color: NEGATIVE_NUMBER_COLOR },
								'\n',
								{ text: '+1', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+5', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+15', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+22.5', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+90', color: POSITIVE_NUMBER_COLOR }
							]),
							'\n',
							columns(
								{ text: 'Use Mouse', color: CLICKABLE_COLOR },
								{ text: 'Reset', color: CLICKABLE_COLOR }
							)
						], [
							overlap(
								{ text: '⏪', color: FIRST_PAGE_LINK_COLOR },
								center([
									{ text: 'Head', color: PAGE_TITLE_COLOR },
									' ',
									{ text: '(2 of 2)', color: DETAILS_COLOR }
								]),
								right(
									{ text: 'ℹ', color: INFO_COLOR }
								)
							),
							'\n',
							columns(
								{ text: 'Use Mouse', color: CLICKABLE_COLOR },
								{ text: 'Reset', color: CLICKABLE_COLOR }
							),
							'\n\n',
							center([
								{ text: 'Z Rotation', color: HEADING_COLOR },
								'\n',
								{ text: '-1', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-5', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-15', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-22.5', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-90', color: NEGATIVE_NUMBER_COLOR },
								'\n',
								{ text: '+1', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+5', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+15', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+22.5', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+90', color: POSITIVE_NUMBER_COLOR }
							]),
							'\n',
							columns(
								{ text: 'Use Mouse', color: CLICKABLE_COLOR },
								{ text: 'Reset', color: CLICKABLE_COLOR }
							),
							'\n\n',
							center([
								{ text: 'Set Rotation', color: HEADING_COLOR },
								'\n',
								{ text: 'Toward Your Eyes', color: CLICKABLE_COLOR },
								'\n',
								{ text: 'Toward Your Feet', color: CLICKABLE_COLOR },
								'\n',
								{ text: 'Away From Your Eyes', color: CLICKABLE_COLOR },
								'\n',
								{ text: 'Away From Your Feet', color: CLICKABLE_COLOR }
							])
						], [
							overlap(
								{ text: '⏪', color: FIRST_PAGE_LINK_COLOR },
								center([
									{ text: 'Left Arm', color: PAGE_TITLE_COLOR },
									' ',
									{ text: '(1 of 2)', color: DETAILS_COLOR }
								]),
								right(
									{ text: 'ℹ', color: INFO_COLOR }
								)
							),
							'\n',
							columns(
								{ text: 'Use Mouse', color: CLICKABLE_COLOR },
								{ text: 'Reset', color: CLICKABLE_COLOR }
							),
							'\n',
							center(
								{ text: 'Mirror Right Arm', color: CLICKABLE_COLOR }
							),
							'\n\n',
							center([
								{ text: 'X Rotation', color: HEADING_COLOR },
								'\n',
								{ text: '-1', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-5', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-15', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-22.5', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-90', color: NEGATIVE_NUMBER_COLOR },
								'\n',
								{ text: '+1', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+5', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+15', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+22.5', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+90', color: POSITIVE_NUMBER_COLOR }
							]),
							'\n',
							columns(
								{ text: 'Use Mouse', color: CLICKABLE_COLOR },
								{ text: 'Reset', color: CLICKABLE_COLOR }
							),
							'\n\n',
							center([
								{ text: 'Y Rotation', color: HEADING_COLOR },
								'\n',
								{ text: '-1', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-5', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-15', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-22.5', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-90', color: NEGATIVE_NUMBER_COLOR },
								'\n',
								{ text: '+1', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+5', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+15', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+22.5', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+90', color: POSITIVE_NUMBER_COLOR }
							]),
							'\n',
							columns(
								{ text: 'Use Mouse', color: CLICKABLE_COLOR },
								{ text: 'Reset', color: CLICKABLE_COLOR }
							)
						], [
							overlap(
								{ text: '⏪', color: FIRST_PAGE_LINK_COLOR },
								center([
									{ text: 'Left Arm', color: PAGE_TITLE_COLOR },
									' ',
									{ text: '(2 of 2)', color: DETAILS_COLOR }
								]),
								right(
									{ text: 'ℹ', color: INFO_COLOR }
								)
							),
							'\n',
							columns(
								{ text: 'Use Mouse', color: CLICKABLE_COLOR },
								{ text: 'Reset', color: CLICKABLE_COLOR }
							),
							'\n',
							center(
								{ text: 'Mirror Right Arm', color: CLICKABLE_COLOR }
							),
							'\n\n',
							center([
								{ text: 'Z Rotation', color: HEADING_COLOR },
								'\n',
								{ text: '-1', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-5', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-15', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-22.5', color: NEGATIVE_NUMBER_COLOR },
								' ',
								{ text: '-90', color: NEGATIVE_NUMBER_COLOR },
								'\n',
								{ text: '+1', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+5', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+15', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+22.5', color: POSITIVE_NUMBER_COLOR },
								' ',
								{ text: '+90', color: POSITIVE_NUMBER_COLOR }
							]),
							'\n',
							columns(
								{ text: 'Use Mouse', color: CLICKABLE_COLOR },
								{ text: 'Reset', color: CLICKABLE_COLOR }
							),
							'\n\n',
							center([
								{ text: 'Set Rotation', color: HEADING_COLOR },
								'\n',
								{ text: 'Toward Your Eyes', color: CLICKABLE_COLOR },
								'\n',
								{ text: 'Toward Your Feet', color: CLICKABLE_COLOR },
								'\n',
								{ text: 'Away From Your Eyes', color: CLICKABLE_COLOR },
								'\n',
								{ text: 'Away From Your Feet', color: CLICKABLE_COLOR }
							])
						]
					].map(page => JSON.stringify(minify(page)))
				})
			}]
		}]
	}]
});

export default book;