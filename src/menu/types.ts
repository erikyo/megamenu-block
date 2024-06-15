/**
 * Style for the editor
 */
import type { BlockAttributes } from '@wordpress/blocks';

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
