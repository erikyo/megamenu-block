import {
	InnerBlockTemplate,
	BlockAttributes,
	BlockInstance,
} from '@wordpress/blocks';

export const TEMPLATE: InnerBlockTemplate[] = [
	[
		'core/group',
		{
			layout: { type: 'constrained', tags: 'nav' },
			className: 'wp-block-megamenu-item',
			children: [],
		},
	],
];

export type DropDownCoords = {
	left?: string;
	right?: string;
	width?: string;
	maxWidth?: string;
	minHeight?: string;
};

export type ParentAttributes = {
	align: string;
	menusMinWidth: string;
	expandDropdown: boolean;
};

export interface MenuItemAttributes extends BlockAttributes {
	text: string;
	linkTarget: string;
	rel: string;
	id: number;
	opensInNewTab: boolean;
	dropdownWrapperStyle: string;
	hasDescendants: boolean;
	parentAttributes: {
		menusMinWidth: string;
		expandDropdown: boolean;
		align: string;
	};
}
