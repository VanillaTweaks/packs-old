import { center, overlap, right } from 'minecraft-text-components';
import type { JSONTextComponent } from 'sandstone';
import { FIRST_PAGE_LINK_COLOR, PAGE_TITLE_COLOR, INFO_COLOR, DETAILS_COLOR } from './colors';

type ContentParameter = [
	/** A text component placed after a line break following the heading. */
	content: JSONTextComponent
];

/** A page of the armor stand book (other than the first). */
const page = (
	heading: string,
	...args: ContentParameter | [
		/** A string inserted immediately after the heading, centered along with it. */
		headingDetails: string,
		...contentParam: ContentParameter
	]
) => {
	const content = args.pop()!;
	const headingDetails = args.pop() as string | undefined;

	return [
		overlap(
			{ text: '⏪', color: FIRST_PAGE_LINK_COLOR },
			center([
				{ text: heading, color: PAGE_TITLE_COLOR },
				...headingDetails === undefined ? [] : [
					' ',
					{ text: headingDetails, color: DETAILS_COLOR }
				]
			]),
			right(
				{ text: 'ℹ', color: INFO_COLOR }
			)
		),
		'\n',
		content
	];
};

export default page;