/**
 * External dependencies
 */
/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import classNames from 'classnames';
import { Controls } from './Controls';
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import type { BlockAttributes } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import { MegaMenuAttributes } from './types';
import { MENU_TEMPLATE } from '../utils/constants';
import { Hamburger } from './Hamburger';

/**
 * Will display the responsive menu if true
 *
 * @param {props}    props               Object containing isSelected, attributes, setAttributes, and clientId
 * @param {boolean}  props.isSelected    Whether the block is selected
 * @param {Object}   props.attributes    The attributes of the block
 * @param {Function} props.setAttributes The function to set the attributes
 * @param {string}   props.clientId      The clientId of the block
 * @return {JSX.Element} The JSX element representing the Edit function
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
			hamburgerColor,
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
		<>
			<Controls
				showResponsiveMenu={ showResponsiveMenu }
				setShowResponsiveMenu={ setShowResponsiveMenu }
				attributes={ props.attributes }
				setAttributes={ setAttributes }
			/>
			<nav
				{ ...useBlockProps( {
					className: classNames(
						'wp-block-megamenu',
						`activator-${ activator }`,
						{
							'is-hidden': showResponsiveMenu,
							[ `has-full-width-dropdown` ]:
								expandDropdown || dropdownMaxWidth === 0,
							[ `is-collapsible` ]: collapseOnMobile,
						}
					),
				} ) }
				data-responsive-breakpoint={ responsiveBreakpoint }
				data-dropdown-content-width={ dropdownMaxWidth }
				data-activator={ activator }
			>
				<div
					{ ...useInnerBlocksProps(
						{
							className: 'wp-block-megamenu__content',
						},
						{
							orientation: 'horizontal',
							templateLock: false,
							template: MENU_TEMPLATE,
							templateInsertUpdatesSelection: false,
						}
					) }
				/>
			</nav>
			<Hamburger
				hamburgerColor={ hamburgerColor }
				menuAlign={ menuAlign }
				showResponsiveMenu={ showResponsiveMenu }
			/>
		</>
	);
}
