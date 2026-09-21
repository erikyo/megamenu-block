import { InnerBlockTemplate, Template } from '@wordpress/blocks';

/**
 * the efault timeout value for the dropdown focus off
 */
export const TIMEOUT: number = 500;

/**
 * Desktop hover intent delay constants (ms) and movement dead zone (px).
 */
export const HOVER_INTENT_DELAY_DEFAULT: number = 160;
export const HOVER_INTENT_DELAY_UPWARD: number = 110;
export const HOVER_INTENT_DELAY_DOWNWARD: number = 300;
export const HOVER_INTENT_DEAD_ZONE_PX: number = 8;

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
