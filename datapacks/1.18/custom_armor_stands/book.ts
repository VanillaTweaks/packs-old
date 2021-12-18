import pack from 'lib/datapacks/pack';
import { LootTable, NBT } from 'sandstone';

const FIRST_PAGE_LINK_COLOR = 'gray';
const PAGE_TITLE_COLOR = 'black';
const PAGE_META_COLOR = 'gray';
const INFO_COLOR = 'dark_red';
const HEADING_COLOR = 'black';
const CLICKABLE_COLOR = '#b26c34';
const CLICKABLE_COLOR_2 = '#a2462a';
const NUMBER_COLOR = 'dark_green';
const NEGATIVE_NUMBER_COLOR = '#e64c4c';
const POSITIVE_NUMBER_COLOR = 'dark_green';

const book = LootTable(pack`book`, {
	// TODO: Remove `as any`.
	type: 'minecraft:command' as any,
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
							'',
							{ text: ' Custom Armor Stands\n         ', color: PAGE_TITLE_COLOR },
							{ text: '⤺', color: CLICKABLE_COLOR },
							'  ',
							{ text: '⟳', color: CLICKABLE_COLOR },
							'  ',
							{ text: '⤻', color: CLICKABLE_COLOR },
							'\n\n    ',
							{ text: 'Select Nearest', color: CLICKABLE_COLOR },
							'\n   ',
							{ text: 'Highlight Selected', color: CLICKABLE_COLOR },
							'\n\n ',
							{ text: 'Position', color: CLICKABLE_COLOR_2 },
							'      ',
							{ text: 'Rotation', color: CLICKABLE_COLOR_2 },
							'\n ',
							{ text: 'Properties', color: CLICKABLE_COLOR_2 },
							'  ',
							{ text: 'Utilities', color: CLICKABLE_COLOR_2 },
							'\n ',
							{ text: 'Presets', color: CLICKABLE_COLOR_2 },
							'\n\n ',
							{ text: 'Head', color: CLICKABLE_COLOR_2 },
							'        ',
							{ text: 'Body', color: CLICKABLE_COLOR_2 },
							'\n ',
							{ text: 'Left Arm', color: CLICKABLE_COLOR_2 },
							'   ',
							{ text: 'Right Arm', color: CLICKABLE_COLOR_2 },
							'\n ',
							{ text: 'Left Leg', color: CLICKABLE_COLOR_2 },
							'   ',
							{ text: 'Right Leg', color: CLICKABLE_COLOR_2 }
						], [
							'',
							{ text: '⏪', color: FIRST_PAGE_LINK_COLOR },
							{ text: '       Position       ', color: PAGE_TITLE_COLOR },
							{ text: 'ℹ', color: INFO_COLOR },
							'\n  ',
							{ text: 'Position With Mouse', color: CLICKABLE_COLOR },
							{ text: '\n\n       Left/Right\n  ', color: HEADING_COLOR },
							{ text: '-8', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-4', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-1', color: NEGATIVE_NUMBER_COLOR },
							'  ',
							{ text: '+1', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+4', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+8', color: POSITIVE_NUMBER_COLOR },
							'\n  ',
							{ text: 'Use Mouse', color: CLICKABLE_COLOR },
							'   ',
							{ text: 'Center', color: CLICKABLE_COLOR },
							{ text: '\n\n        Down/Up\n  ', color: HEADING_COLOR },
							{ text: '-8', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-4', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-1', color: NEGATIVE_NUMBER_COLOR },
							'  ',
							{ text: '+1', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+4', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+8', color: POSITIVE_NUMBER_COLOR },
							'\n  ',
							{ text: 'Use Mouse', color: CLICKABLE_COLOR },
							'    ',
							{ text: 'Snap', color: CLICKABLE_COLOR },
							{ text: '\n\n     Back/Forward\n  ', color: HEADING_COLOR },
							{ text: '-8', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-4', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-1', color: NEGATIVE_NUMBER_COLOR },
							'  ',
							{ text: '+1', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+4', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+8', color: POSITIVE_NUMBER_COLOR },
							'\n  ',
							{ text: 'Use Mouse', color: CLICKABLE_COLOR },
							'   ',
							{ text: 'Center', color: CLICKABLE_COLOR }
						], [
							'',
							{ text: '⏪', color: FIRST_PAGE_LINK_COLOR },
							{ text: '       Rotation       ', color: PAGE_TITLE_COLOR },
							{ text: 'ℹ', color: INFO_COLOR },
							{ text: '\n\n   Rotate Left/Right\n ', color: HEADING_COLOR },
							{ text: '-1', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-5', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-15', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-22.5', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-90', color: NEGATIVE_NUMBER_COLOR },
							'\n ',
							{ text: '+1', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+5', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+15', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+22.5', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+90', color: POSITIVE_NUMBER_COLOR },
							'\n       ',
							{ text: 'Use Mouse', color: CLICKABLE_COLOR },
							{ text: '\n\n  Snap to Multiple of\n  ', color: HEADING_COLOR },
							{ text: '5', color: NUMBER_COLOR },
							'  ',
							{ text: '15', color: NUMBER_COLOR },
							'  ',
							{ text: '22.5', color: NUMBER_COLOR },
							'  ',
							{ text: '45', color: NUMBER_COLOR },
							'  ',
							{ text: '90', color: NUMBER_COLOR },
							{ text: '\n\n      Set Rotation\n      ', color: HEADING_COLOR },
							{ text: 'Toward You', color: CLICKABLE_COLOR },
							'\n    ',
							{ text: 'Away From You', color: CLICKABLE_COLOR }
						], [
							'',
							{ text: '⏪', color: FIRST_PAGE_LINK_COLOR },
							{ text: '     Properties     ', color: PAGE_TITLE_COLOR },
							{ text: 'ℹ', color: INFO_COLOR },
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
							'',
							{ text: '⏪', color: FIRST_PAGE_LINK_COLOR },
							{ text: '       Utilities        ', color: PAGE_TITLE_COLOR },
							{ text: 'ℹ', color: INFO_COLOR },
							'\n\n     ',
							{ text: 'Copy     Paste', color: CLICKABLE_COLOR_2 },
							'\n      ',
							{ text: 'Save to Book', color: CLICKABLE_COLOR_2 },
							'\n\n    ',
							{ text: 'Flip Horizontally', color: CLICKABLE_COLOR },
							{ text: '\n\n    Swap Right Hand\n         Slot With\n     ', color: HEADING_COLOR },
							{ text: 'Left Hand Slot', color: CLICKABLE_COLOR },
							'\n          ',
							{ text: 'Helmet', color: CLICKABLE_COLOR },
							'\n       ',
							{ text: 'Chestplate', color: CLICKABLE_COLOR },
							'\n        ',
							{ text: 'Leggings', color: CLICKABLE_COLOR },
							'\n          ',
							{ text: 'Boots', color: CLICKABLE_COLOR }
						], [
							'',
							{ text: '⏪', color: FIRST_PAGE_LINK_COLOR },
							{ text: '    Head', color: PAGE_TITLE_COLOR },
							{ text: ' (1 of 2)   ', color: PAGE_META_COLOR },
							{ text: 'ℹ', color: INFO_COLOR },
							'\n   ',
							{ text: 'Rotate With Mouse', color: CLICKABLE_COLOR },
							{ text: '\n\n       X Rotation\n ', color: HEADING_COLOR },
							{ text: '-1', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-5', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-15', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-22.5', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-90', color: NEGATIVE_NUMBER_COLOR },
							'\n ',
							{ text: '+1', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+5', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+15', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+22.5', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+90', color: POSITIVE_NUMBER_COLOR },
							'\n       ',
							{ text: 'Use Mouse', color: CLICKABLE_COLOR },
							{ text: '\n\n       Y Rotation\n ', color: HEADING_COLOR },
							{ text: '-1', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-5', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-15', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-22.5', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-90', color: NEGATIVE_NUMBER_COLOR },
							'\n ',
							{ text: '+1', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+5', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+15', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+22.5', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+90', color: POSITIVE_NUMBER_COLOR },
							'\n       ',
							{ text: 'Use Mouse', color: CLICKABLE_COLOR }
						], [
							'',
							{ text: '⏪', color: FIRST_PAGE_LINK_COLOR },
							{ text: '    Head', color: PAGE_TITLE_COLOR },
							{ text: ' (2 of 2)   ', color: PAGE_META_COLOR },
							{ text: 'ℹ', color: INFO_COLOR },
							'\n   ',
							{ text: 'Rotate With Mouse', color: CLICKABLE_COLOR },
							{ text: '\n\n       Z Rotation\n ', color: HEADING_COLOR },
							{ text: '-1', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-5', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-15', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-22.5', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-90', color: NEGATIVE_NUMBER_COLOR },
							'\n ',
							{ text: '+1', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+5', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+15', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+22.5', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+90', color: POSITIVE_NUMBER_COLOR },
							'\n       ',
							{ text: 'Use Mouse', color: CLICKABLE_COLOR },
							{ text: '\n\n       Set Rotation\n   ', color: HEADING_COLOR },
							{ text: 'Toward Your Eyes', color: CLICKABLE_COLOR },
							'\n   ',
							{ text: 'Toward Your Feet', color: CLICKABLE_COLOR },
							'\n ',
							{ text: 'Away From Your Eyes', color: CLICKABLE_COLOR },
							'\n ',
							{ text: 'Away From Your Feet', color: CLICKABLE_COLOR }
						], [
							'',
							{ text: '⏪', color: FIRST_PAGE_LINK_COLOR },
							{ text: ' Left Arm', color: PAGE_TITLE_COLOR },
							{ text: ' (1 of 2) ', color: PAGE_META_COLOR },
							{ text: 'ℹ', color: INFO_COLOR },
							'\n   ',
							{ text: 'Rotate With Mouse', color: CLICKABLE_COLOR },
							'\n    ',
							{ text: 'Mirror Right Arm', color: CLICKABLE_COLOR },
							{ text: '\n\n       X Rotation\n ', color: HEADING_COLOR },
							{ text: '-1', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-5', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-15', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-22.5', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-90', color: NEGATIVE_NUMBER_COLOR },
							'\n ',
							{ text: '+1', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+5', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+15', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+22.5', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+90', color: POSITIVE_NUMBER_COLOR },
							'\n       ',
							{ text: 'Use Mouse', color: CLICKABLE_COLOR },
							{ text: '\n\n       Y Rotation\n ', color: HEADING_COLOR },
							{ text: '-1', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-5', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-15', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-22.5', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-90', color: NEGATIVE_NUMBER_COLOR },
							'\n ',
							{ text: '+1', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+5', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+15', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+22.5', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+90', color: POSITIVE_NUMBER_COLOR },
							'\n       ',
							{ text: 'Use Mouse', color: CLICKABLE_COLOR }
						], [
							'',
							{ text: '⏪', color: FIRST_PAGE_LINK_COLOR },
							{ text: ' Left Arm', color: PAGE_TITLE_COLOR },
							{ text: ' (2 of 2) ', color: PAGE_META_COLOR },
							{ text: 'ℹ', color: INFO_COLOR },
							'\n   ',
							{ text: 'Rotate With Mouse', color: CLICKABLE_COLOR },
							'\n    ',
							{ text: 'Mirror Right Arm', color: CLICKABLE_COLOR },
							{ text: '\n\n       Z Rotation\n ', color: HEADING_COLOR },
							{ text: '-1', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-5', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-15', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-22.5', color: NEGATIVE_NUMBER_COLOR },
							' ',
							{ text: '-90', color: NEGATIVE_NUMBER_COLOR },
							'\n ',
							{ text: '+1', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+5', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+15', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+22.5', color: POSITIVE_NUMBER_COLOR },
							' ',
							{ text: '+90', color: POSITIVE_NUMBER_COLOR },
							'\n       ',
							{ text: 'Use Mouse', color: CLICKABLE_COLOR },
							{ text: '\n\n      Set Rotation\n  ', color: HEADING_COLOR },
							{ text: 'Toward Your Eyes', color: CLICKABLE_COLOR },
							'\n  ',
							{ text: 'Toward Your Feet', color: CLICKABLE_COLOR },
							'\n ',
							{ text: 'Away From Your Eyes', color: CLICKABLE_COLOR },
							'\n ',
							{ text: 'Away From Your Feet', color: CLICKABLE_COLOR }
						]
					].map(page => JSON.stringify(page))
				})
			}]
		}],
		// TODO: Remove this.
		bonus_rolls: 0
	}]
});

export default book;