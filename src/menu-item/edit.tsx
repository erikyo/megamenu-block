/**
 * External dependencies
 */
import classnames from 'classnames';
import { __ } from '@wordpress/i18n';
import Controls from './controls';
import { useEffect, useRef, useState } from '@wordpress/element';
import {
	RichText,
	InnerBlocks,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { withDispatch, withSelect } from '@wordpress/data';
import { Icon } from '@wordpress/components';
import { chevronDown } from '@wordpress/icons';
import { calcNewPosition } from '../utils';
import { compose } from '@wordpress/compose';

type DropDownCoords =
	| { left: number; width: number; maxWidth: number }
	| DOMRect;

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

	const { text } = attributes;

	// TODO: handle with effect
	const menuItemHasChildrens = hasDescendants;

	// the menu item ref
	const menuItemRef = useRef< HTMLDivElement >( null );
	const dropdownRef = useRef< HTMLDivElement >( null );

	const [ showDropdown, setShowDropdown ] = useState( false );

	const [ dropdownPosition, setDropdownPosition ]: [ DropDownCoords, any ] =
		useState( {
			left: 0,
			width: 0,
			maxWidth: document.body.clientWidth,
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
		const megamenuItem = menuItemRef.current;
		const megamenu = megamenuItem
			?.closest( '[data-block="' + rootBlockClientId + '"]' )
			?.querySelector( '.wp-block-megamenu' );

		const rootBlockNode = megamenu?.ownerDocument.body;

		const blockCoords = megamenu?.getBoundingClientRect();
		const rootCoords = rootBlockNode?.getBoundingClientRect();

		if ( rootCoords && blockCoords ) {
			const maxWidth =
				parentAttributes.dropdownMaxWidth !== 0
					? parentAttributes.dropdownMaxWidth
					: rootCoords.width;

			setDropdownPosition(
				calcNewPosition( rootCoords, blockCoords, maxWidth )
			);
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
					<span className={ 'wp-block-megamenu-item__text' }>
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
					</span>
					{ menuItemHasChildrens ? (
						<Icon
							icon={ chevronDown }
							className="wp-block-megamenu-item__toggle"
							style={ {
								fill: 'currentColor',
							} }
						/>
					) : null }
				</a>
				<div
					ref={ dropdownRef }
					className={ 'wp-block-megamenu-item__dropdown' }
					style={ {
						left: ( dropdownPosition?.left || 0 ) + 'px',
						width:
							( dropdownPosition?.width ||
								document.body.clientWidth ) + 'px',
						maxWidth:
							( dropdownPosition?.maxWidth ||
								document.body.clientWidth ) + 'px',
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
		const rootBlockClientId = getBlockParentsByBlockName( clientId, [
			'megamenu/menu',
			'core/navigation',
		] )[ 0 ];

		const parentBlock = getBlock( rootBlockClientId );
		const parentAttributes = parentBlock.attributes;

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
				const block = createBlock( 'core/group', {
					className: 'dropdown-inner',
					layout: { type: 'constrained' },
				} );
				dispatch( blockEditorStore ).insertBlock(
					block,
					undefined,
					clientId
				);
			},
		};
	} ),
] as any )( MenuItemEdit );
