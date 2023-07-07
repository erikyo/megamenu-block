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
import { withDispatch, withSelect} from '@wordpress/data';
import { Icon } from '@wordpress/components';
import { chevronDown } from '@wordpress/icons';
import { calcNewPosition } from '../utils';
import { compose } from '@wordpress/compose';

/**
 * WordPress dependencies
 */
const { isEqual } = lodash;

/**
 * Internal dependencies
 *
 * @param props
 */
export function MenuItemEdit( props ) {
	const {
		attributes,
		setAttributes,
		isSelected,
		onReplace,
		mergeBlocks,
		isParentOfSelectedBlock,
		hasDescendants,
		updateInnerBlocks,
		rootBlockClientId,
		parentAttributes,
	} = props;

	// get the menu id
	const { clientId } = useBlockEditContext();

	const { text } = attributes;

	const isMenuItemSelected = isSelected || isParentOfSelectedBlock;
	const menuItemHasChildrens = hasDescendants;

	// the menu item ref
	const menuItemRef = useRef( null );

	const [ showDropdown, setShowDropdown ] = useState( false );

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

	const addMenuItemDropdown = () => {
		updateInnerBlocks();
		// then open the dropdown
		setShowDropdown( true );
	};

	const updateDropdownPosition = () => {
		let newDropdownPosition = {};
		let rootBlockNode;
		const blockNode = menuItemRef.current as HTMLElement;

		if ( ! blockNode ) {
			return;
		}

		if ( parentAttributes.expandDropdown ) {
			rootBlockNode = blockNode.closest( '.editor-styles-wrapper' );
		} else {
			rootBlockNode = blockNode
				?.closest( '[data-block="' + rootBlockClientId + '"]' )
				?.querySelector( '.wp-block-megamenu' );
		}

		if ( rootBlockNode ) {
			const rootCoords = rootBlockNode?.getBoundingClientRect();
			const blockCoords = blockNode.getBoundingClientRect();

			newDropdownPosition = calcNewPosition(
				rootCoords,
				blockCoords,
				parentAttributes.menusMinWidth
			);

			if ( ! isEqual( newDropdownPosition, dropdownPosition ) ) {
				setDropdownPosition( newDropdownPosition );
			}
		} else {
			console.log( 'rootBlockNode not found' );
		}
	};

	useEffect( () => {
		updateDropdownPosition();
		setParentAttributes();
		setShowDropdown(
			( isSelected || isParentOfSelectedBlock ) && menuItemHasChildrens
		);
	}, [ isSelected ] );

	useEffect( () => {
		const blockNode: HTMLElement | null = menuItemRef.current;

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
				toggleItemDropdown={ addMenuItemDropdown }
				hasDescendants={ menuItemHasChildrens }
			/>
			<div
				className={ classnames( 'wp-block-megamenu-item', {
					'has-children': menuItemHasChildrens,
					'is-opened': showDropdown,
					'has-full-width-dropdown':
						parentAttributes.menusMinWidth === '0',
				} ) }
				ref={ menuItemRef }
			>
				<a
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
					{ menuItemHasChildrens ? (
						<Icon
							icon={ chevronDown }
							className="wp-block-megamenu-item__toggle"
						/>
					) : null }
				</a>
				<div
					className={ 'wp-block-megamenu-item__dropdown' }
					style={ {
						left: dropdownPosition.left,
						width: dropdownPosition.width,
						maxWidth:
							parentAttributes.dropdownMaxWidth ||
							window.innerWidth,
					} }
				>
					<InnerBlocks />
				</div>
			</div>
		</>
	);
}

export default compose( [
	withSelect( ( select, ownProps ) => {
		const {
			hasSelectedInnerBlock,
			getBlockCount,
			getBlockParentsByBlockName,
			getBlock,
		} = select( blockEditorStore );
		const { clientId } = ownProps;
		const isParentOfSelectedBlock = hasSelectedInnerBlock( clientId, true );
		const hasDescendants = !! getBlockCount( clientId );
		const rootBlockClientId = getBlockParentsByBlockName( clientId, 'megamenu/menu' )[0];

		const parentAttributes = getBlock( rootBlockClientId ).attributes;

		return {
			isParentOfSelectedBlock,
			hasDescendants,
			rootBlockClientId,
			parentAttributes,
		};
	} ),
	withDispatch( ( dispatch, { clientId } ) => {
		return {
			updateInnerBlocks() {
				dispatch( blockEditorStore ).replaceInnerBlocks(
					clientId,
					[],
					false
				);
			},
		};
	} ),
] as any )( MenuItemEdit );
