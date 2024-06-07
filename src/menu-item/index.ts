import { registerBlockType } from '@wordpress/blocks';

import blockMeta from './block.json';
import Save from './Save';
import Edit from './Edit';
import { CHILDREN_ICON } from '../utils/icons';
import './style.scss';

registerBlockType( blockMeta.name, {
	icon: CHILDREN_ICON,
	edit: Edit,
	save: Save,
} );
