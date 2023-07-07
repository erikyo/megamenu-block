/**
 * External dependencies
 */
import { withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
/**
 * WordPress dependencies
 */
import { useRef, useState } from '@wordpress/element';
import classnames from 'classnames';
import { Controls } from './controls';
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

const TEMPLATE = [
	[
		'core/group',
		{
			layout: {
				type: 'flex',
				flexWrap: 'nowrap',
				verticalAlignment: 'stretch',
			},
		},
		[ [ 'megamenu/menu-item', {} ] ],
	],
];

const ALLOWED_BLOCKS = [
	'megamenu/menu-item',
	'codekraft/oh-my-svg',
	'core/group',
	'core/site-logo',
	'core/social-link',
];

function MegaMenu( args ) {
	const {
		selectedBlockHasDescendants,
		isImmediateParentOfSelectedBlock,
		isSelected,
		attributes,
	} = args;

	const [ showResponsiveMenu, setShowResponsiveMenu ] = useState( false );

	const ref = useRef();

	return (
		<>
			<Controls { ...args } />
			<nav
				className={ classnames(
					'wp-block-megamenu',
					`activator-${ attributes.activator }`,
					{
						[ `has-full-width-dropdown` ]:
							attributes.expandDropdown ||
							attributes.dropdownMaxWidth === 0,
						[ `is-collapsible` ]: attributes.collapseOnMobile,
					}
				) }
				data-responsive-breakpoint={ attributes.responsiveBreakpoint }
				data-dropdown-content-width={ attributes.dropdownMaxWidth }
			>
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
			</nav>
			<div
				className={ classnames( 'wp-block-megamenu__toggle-wrapper', {
					'is-hidden': ! showResponsiveMenu,
				} ) }
			>
				<Button className="wp-block-megamenu__toggle">
					<span className="dashicons dashicons-menu"></span>
					{ __( 'Menu', 'megamenu' ) }
				</Button>
			</div>
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
