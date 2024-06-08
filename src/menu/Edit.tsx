/**
 * External dependencies
 */
/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import classnames from 'classnames';
import { Controls } from './Controls';
import { InnerBlocks } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import type { BlockAttributes } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import { MegaMenuAttributes, TEMPLATE } from './constants';

/**
 * The `MegaMenu` edit component.
 * @param args
 * @param args.isImmediateParentOfSelectedBlock
 * @param args.isSelected
 * @param args.attributes
 * @param args.setAttributes
 * @param args.clientId
 * @param props
 * @param props.isSelected
 * @param props.attributes
 * @param props.setAttributes
 * @param props.clientId
 */
export default function Edit( props: {
	isSelected: boolean;
	attributes: MegaMenuAttributes;
	setAttributes: ( attributes: BlockAttributes ) => void;
	clientId: string;
} ): JSX.Element {
	const {
		clientId,
		attributes: {
			activator,
			expandDropdown,
			collapseOnMobile,
			responsiveBreakpoint,
			dropdownMaxWidth,
			menuAlign,
		},
		isSelected: boolean,
		setAttributes,
	} = props;

	/**
	 * Will display the responsive menu if true
	 */
	const [ showResponsiveMenu, setShowResponsiveMenu ] = useState( false );

	useSelect(
		( select, {} ) => {
			const {
				getClientIdsOfDescendants,
				hasSelectedInnerBlock,
				getSelectedBlockClientId,
				getBlocksByClientId,
			}: {
				withInstanceId: string;
				getClientIdsOfDescendants: Function;
				hasSelectedInnerBlock: Function;
				getSelectedBlockClientId: Function;
				getBlocksByClientId: Function;
				getBlock: Function;
			} = select( 'core/block-editor' );
			// Returns true if one of the block’s inner blocks is selected.
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
		},
		[ clientId ]
	);

	return (
		<div>
			<Controls
				showResponsiveMenu={ showResponsiveMenu }
				setShowResponsiveMenu={ setShowResponsiveMenu }
				attributes={ props.attributes }
				setAttributes={ setAttributes }
			/>
			<nav
				className={ classnames(
					'wp-block-megamenu',
					`activator-${ activator }`,
					{
						'is-hidden': showResponsiveMenu,
						[ `has-full-width-dropdown` ]:
							expandDropdown || dropdownMaxWidth === 0,
						[ `is-collapsible` ]: collapseOnMobile,
					}
				) }
				data-responsive-breakpoint={ responsiveBreakpoint }
				data-dropdown-content-width={ dropdownMaxWidth }
			>
				<div className={ 'wp-block-megamenu__content' }>
					<InnerBlocks
						orientation="horizontal"
						templateLock={ false }
						template={ TEMPLATE }
						templateInsertUpdatesSelection={ false }
					/>
				</div>
			</nav>
			<div
				className={ classnames(
					'wp-block-megamenu__toggle-wrapper',
					`align-${ menuAlign || 'right' }`,
					{
						'is-hidden': ! showResponsiveMenu,
					}
				) }
			>
				<Button className="wp-block-megamenu__toggle hamburger">
					<div></div>
				</Button>
			</div>
		</div>
	);
}
