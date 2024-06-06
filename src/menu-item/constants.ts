import { BlockAttributes } from '@wordpress/blocks';

export type DropDownCoords =
	| { left: number; width: number; maxWidth: number }
	| DOMRect;

export interface MenuItemAttributes extends BlockAttributes {
	text: string;
	linkTarget: string;
	rel: string;
	id: number;
	opensInNewTab: boolean;
	dropdownWrapperStyle: string;
	parentAttributes: string;
}
