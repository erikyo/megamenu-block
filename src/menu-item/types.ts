import type { BlockAttributes } from '@wordpress/blocks';

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
	target: string;
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
