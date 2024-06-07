import { InnerBlockTemplate, BlockAttributes } from '@wordpress/blocks';

export const TEMPLATE: InnerBlockTemplate = [
	'core/group',
	{ layout: { type: 'constrained' } },
];

export type DropDownCoords = { left: string; width: string; maxWidth: string };

export interface MenuItemAttributes extends BlockAttributes {
	text: string;
	linkTarget: string;
	rel: string;
	id: number;
	opensInNewTab: boolean;
	dropdownWrapperStyle: string;
	parentAttributes: {
		hasDescendants: boolean;
		menusMinWidth: string;
		align: string;
	};
}
