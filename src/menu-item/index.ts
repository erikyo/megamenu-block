import { BlockAttributes, registerBlockType } from '@wordpress/blocks';

import blockMeta from './block.json';
const metadata = blockMeta as BlockAttributes;
import Save from './Save';
import Edit from './Edit';
import { CHILDREN_ICON } from '../utils/icons';
import './style.scss';

registerBlockType( metadata.name, {
	icon: CHILDREN_ICON,
	edit: Edit,
	save: Save,
} );
