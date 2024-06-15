import { InnerBlockTemplate, Template } from '@wordpress/blocks';

/**
 * the efault timeout value for the dropdown focus off
 */
export const TIMEOUT: number = 500;

export type EVENTS_ALLOWED = 'click' | 'hover';

export const NEW_TAB_REL = 'noreferrer noopener';

export const IS_OPEN = 'is-opened';

export const DROPDOWN_TEMPLATE: InnerBlockTemplate[] = [
	[
		'core/group',
		{
			backgroundColor: 'background',
			className: 'wp-block-megamenu-item',
			layout: { type: 'constrained' },
		},
	],
];

export const MENU_TEMPLATE: Template[] = [
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
];
