/**
 * External dependencies
 */
import { withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
/**
 * WordPress dependencies
 */
import { useRef } from '@wordpress/element';
import classnames from 'classnames';
import { Controls } from './controls';
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

const TEMPLATE = [ [ 'megamenu/menu-item', {} ] ];

const ALLOWED_BLOCKS = [
	'megamenu/menu-item',
	'codekraft/oh-my-svg',
	'core/group',
];

function MegaMenu( args ) {
	const {
		selectedBlockHasDescendants,
		isImmediateParentOfSelectedBlock,
		isSelected,
		attributes,
	} = args;

	const ref = useRef();

	const menuClasses = classnames(
		'wp-block-megamenu',
		`activator-${ attributes.activator }`,
		{
			[ `has-full-width-dropdown` ]: attributes.expandDropdown,
			[ `has-text-align-${ attributes.align }` ]: attributes.align,
		}
	);

	return (
		<>
			<Controls { ...args } />
			<nav className={ menuClasses }>
				<div className="wp-block-megamenu__wrapper">
					<div className="wp-block-megamenu__content">
						<InnerBlocks
							parentData={ attributes }
							ref={ ref }
							template={ TEMPLATE }
							templateLock={ false }
							allowedBlocks={ ALLOWED_BLOCKS }
							templateInsertUpdatesSelection={ false }
							renderAppender={
								( isImmediateParentOfSelectedBlock &&
									! selectedBlockHasDescendants ) ||
								isSelected
									? InnerBlocks.DefaultAppender
									: false
							}
							__experimentalMoverDirection="horizontal"
							orientation="horizontal"
						/>
					</div>
				</div>
			</nav>
		</>
	);
}

export default compose( [
	withSelect( ( select, { clientId } ) => {
		// get the selected block attributes
		const {
			getClientIdsOfDescendants,
			hasSelectedInnerBlock,
			getSelectedBlockClientId,
			getBlocksByClientId,
		} = select( 'core/block-editor' );
		// check if the selected block is an immediate parent
		const isImmediateParentOfSelectedBlock = hasSelectedInnerBlock(
			clientId,
			false
		);

		// get the selected block client id
		const selectedBlockId = getSelectedBlockClientId();

		// check if the selected block has descendants
		const selectedBlockHasDescendants = !! getClientIdsOfDescendants( [
			selectedBlockId,
		] )?.length;

		// get the menu items
		const menuItems = getBlocksByClientId( clientId )[ 0 ].innerBlocks;

		// returns the menu item data for the selected block
		return {
			isImmediateParentOfSelectedBlock,
			selectedBlockHasDescendants,
			menuItems,
		};
	} ),
] as any )( MegaMenu );
