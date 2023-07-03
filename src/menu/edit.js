/**
 * External dependencies
 */
import classnames from 'classnames';
import Controls from './controls';
import { useRef } from '@wordpress/element';
import * as PropTypes from 'prop-types';
import { withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { InnerBlocks } from '@wordpress/block-editor';

/**
 * WordPress dependencies
 */

const TEMPLATE = [ [ 'getwid-megamenu/menu-item', {} ] ];

const ALLOWED_BLOCKS = [ 'getwid-megamenu/menu-item' ];

InnerBlocks.propTypes = {
	template: PropTypes.arrayOf( PropTypes.any ),
	ref: PropTypes.any,
	orientation: PropTypes.string,
	templateLock: PropTypes.bool,
	renderAppender: PropTypes.any,
	allowedBlocks: PropTypes.arrayOf( PropTypes.string ),
	templateInsertUpdatesSelection: PropTypes.bool,
	__experimentalMoverDirection: PropTypes.string,
};

function MegaMenu( args ) {
	const {
		selectedBlockHasDescendants,
		isImmediateParentOfSelectedBlock,
		isSelected,
		attributes,
	} = args;

	const ref = useRef();

	const menuClasses = classnames( 'wp-block-getwid-megamenu', 'gw-mm', {
		[ `justify-items-${ attributes.itemsJustification }` ]:
			attributes.itemsJustification,
		[ `has-full-width-dropdown` ]: attributes.expandDropdown,
	} );

	const menuWrapperStyle = {
		maxWidth: attributes.menuMaxWidth,
	};

	return (
		<>
			<Controls { ...args } />
			<div className={ menuClasses }>
				<div className="gw-mm__wrapper" style={ menuWrapperStyle }>
					<div className="gw-mm__content-wrapper">
						<div className="gw-mm__content">
							<InnerBlocks
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
				</div>
			</div>
		</>
	);
}

export default compose( [
	withSelect( ( select, { clientId } ) => {
		const {
			getClientIdsOfDescendants,
			hasSelectedInnerBlock,
			getSelectedBlockClientId,
			getBlocksByClientId,
		} = select( 'core/block-editor' );
		const isImmediateParentOfSelectedBlock = hasSelectedInnerBlock(
			clientId,
			false
		);
		const selectedBlockId = getSelectedBlockClientId();
		const selectedBlockHasDescendants = !! getClientIdsOfDescendants( [
			selectedBlockId,
		] )?.length;
		const menuItems = getBlocksByClientId( clientId )[ 0 ].innerBlocks;

		return {
			isImmediateParentOfSelectedBlock,
			selectedBlockHasDescendants,
			menuItems,
		};
	} ),
] )( MegaMenu );
