/**
 * External dependencies
 */
import classnames from 'classnames';
import { __ } from '@wordpress/i18n';
import Controls from './controls';
import { useEffect, useRef, useState } from '@wordpress/element';
import {
	RichText,
	useBlockEditContext,
	InnerBlocks,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { dispatch, select } from '@wordpress/data';
import { Icon } from '@wordpress/components';
import { chevronDown } from '@wordpress/icons';

/**
 * WordPress dependencies
 */
const { isEqual, head } = lodash;

/**
 * Internal dependencies
 *
 * @param props
 */
export default function Edit( props ) {
	const { attributes, setAttributes, isSelected, onReplace } = props;

	const { text } = attributes;

	const {
		getBlockParentsByBlockName,
		hasSelectedInnerBlock,
		getBlockCount,
		getBlock,
		mergeBlocks,
	} = select( blockEditorStore );

	// the menu item ref
	const menuItemRef = useRef( null );

	// get the menu id
	const { clientId } = useBlockEditContext();

	const isParentOfSelectedBlock = hasSelectedInnerBlock( clientId, true );
	const hasDescendants = !! getBlockCount( clientId );

	const [ isItemDropdownOpened, setIsItemDropdownOpened ] =
		useState( hasDescendants );

	const rootBlockClientId =
		getBlockParentsByBlockName( clientId, 'megamenu/menu' )[ 0 ] || false;

	const parentBlock = getBlock( rootBlockClientId );
	const parentAttributes = parentBlock.attributes;
	const isMenuItemSelected = isSelected || isParentOfSelectedBlock;
	const menuItemHasChildrens = isItemDropdownOpened || hasDescendants;
	const showDropdown = isMenuItemSelected && menuItemHasChildrens;

	const [ dropdownPosition, setDropdownPosition ] = useState( {
		left: 0,
		width: '100%',
	} );

	function setParentAttributes() {
		setAttributes( {
			parentAttributes: {
				align: parentAttributes.align,
				menusMinWidth: parentAttributes.menusMinWidth,
				menuItemHasChildrens,
			},
		} );
	}

	const toggleItemDropdown = () => {
		// if the item has no descendants add one
		if ( ! hasDescendants ) {
			dispatch( blockEditorStore ).replaceInnerBlocks(
				clientId,
				[],
				false
			);
		}
		// then open the dropdown
		setIsItemDropdownOpened( ! isItemDropdownOpened );
	};

	const updateDropdownPosition = () => {
		let newDropdownPosition = {};
		let rootBlockNode;
		const blockNode = menuItemRef.current as HTMLElement;

		if ( ! blockNode ) {
			return;
		}

		const blockCoords = blockNode.getBoundingClientRect();

		if ( parentAttributes.expandDropdown ) {
			rootBlockNode = blockNode.closest( '.editor-styles-wrapper' );
		} else {
			rootBlockNode = blockNode
				?.closest( '[data-block="' + rootBlockClientId + '"]' )
				?.querySelector( '.wp-block-megamenu' );
		}

		const rootCoords = rootBlockNode?.getBoundingClientRect();

		if ( rootCoords ) {
			let left = -( blockCoords.x - rootCoords.x );

			if (
				parentAttributes.dropdownMaxWidth &&
				rootCoords.width > parentAttributes.dropdownMaxWidth
			) {
				left =
					left +
					( rootCoords.width - parentAttributes.dropdownMaxWidth ) /
						2;
			}

			newDropdownPosition = { left, width: rootCoords.width };

			if ( ! isEqual( newDropdownPosition, dropdownPosition ) ) {
				setDropdownPosition( newDropdownPosition );
			}
		}
	};

	useEffect( () => {
		updateDropdownPosition();
		setParentAttributes();
	}, [ isSelected ] );

	useEffect( () => {
		const blockNode = menuItemRef.current;

		if ( blockNode ) {
			blockNode.ownerDocument.defaultView.addEventListener(
				'resize',
				updateDropdownPosition
			);
		}
	}, [] );

	return (
		<>
			<Controls
				{ ...props }
				toggleItemDropdown={ toggleItemDropdown }
				isItemDropdownOpened={ isItemDropdownOpened }
				hasDescendants={ hasDescendants }
			/>
			<div
				className={ classnames( 'wp-block-megamenu-item', {
					'has-children': hasDescendants,
					'is-opened': showDropdown,
					'has-full-width-dropdown':
						attributes.expandDropdown ||
						parentAttributes.menusMinWidth === 0,
				} ) }
				ref={ menuItemRef }
			>
				<div
					className={ 'wp-block-megamenu-item__link' }
					style={ {
						minWidth: parentAttributes.menusMinWidth
							? parentAttributes.menusMinWidth + 'px'
							: 'auto',
						justifyContent: parentAttributes.align
							? parentAttributes.align
							: 'left',
					} }
				>
					<a>
						<RichText
							placeholder={ __( 'Add a menu item' ) }
							value={ text }
							onChange={ ( value ) =>
								setAttributes( { text: value } )
							}
							withoutInteractiveFormatting
							onReplace={ onReplace }
							onMerge={ mergeBlocks }
							identifier="text"
						/>
						{ menuItemHasChildrens && (
							<Icon
								icon={ chevronDown }
								className="wp-block-megamenu-item__toggle"
							/>
						) }
					</a>
				</div>
				{ showDropdown && (
					<div
						className={ 'wp-block-megamenu-item__dropdown' }
						style={ {
							left: dropdownPosition.left,
							width: dropdownPosition.width,
							maxWidth:
								parentAttributes.dropdownMaxWidth ||
								window.innerWidth,
							position: parentAttributes.alignment,
						} }
					>
						<InnerBlocks />
					</div>
				) }
			</div>
		</>
	);
}
