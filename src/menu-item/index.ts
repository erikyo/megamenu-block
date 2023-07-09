import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import blockMeta from '../megamenu-item.json';
import save from './save';
import edit from './edit';

registerBlockType( blockMeta.name, {
	...blockMeta,
	title: __( 'Menu Item', 'megamenu' ),
	edit,
	save,
} );
