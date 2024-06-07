import { type BlockAttributes, registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
const blockdata = metadata as BlockAttributes;
import Save from './Save';
import Edit from './Edit';

registerBlockType( blockdata.name, {
	edit: Edit,
	save: Save,
} );
