import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import blockMeta from '../megamenu-item.json';
import save from './save';
import edit from './edit';
import { CHILDREN_ICON } from '../utils/icons';

registerBlockType( blockMeta.name, {
	...blockMeta,
	title: __( 'Menu Item', 'megamenu' ),
	icon: CHILDREN_ICON,
	edit,
	save,
} );
