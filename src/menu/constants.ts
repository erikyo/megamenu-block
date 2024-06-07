/**
 * Style for the editor
 */
import { BlockAttributes, Template } from '@wordpress/blocks';

export const TEMPLATE = [
	[
		'core/group',
		{
			layout: {
				type: 'flex',
				flexWrap: 'nowrap',
				justifyContent: 'center',
			},
		},
		[ [ 'megamenu/menu-item', {} ] ],
	],
] as Template[];

export const ALLOWED_BLOCKS = [
	'megamenu/menu-item',
	'codekraft/oh-my-svg',
	'core/group',
	'core/heading',
	'core/paragraph',
	'core/site-logo',
	'core/social-link',
];

export interface MegaMenuAttributes extends BlockAttributes {
	menusMinWidth: number;
	activator: string;
	collapseOnMobile: boolean;
	responsiveBreakpoint: number;
	dropdownMaxWidth: number;
	expandDropdown: boolean;
	menuAlign: string;
	align: string;
}
