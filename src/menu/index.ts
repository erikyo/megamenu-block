import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import metadata from '../megamenu.json';
import save from './save';
import edit from './edit';

registerBlockType( metadata.name, {
	...metadata,
	title: __( 'Mega Menu', 'megamenu' ),
	keywords: [ __( 'navigation', 'megamenu' ), __( 'links', 'megamenu' ) ],
	edit,
	save,
} );
