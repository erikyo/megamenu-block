/**
 * External dependencies
 */
import classnames from 'classnames';
import { __ } from '@wordpress/i18n';
import Controls from './Controls';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import {
	RichText,
	store as blockEditorStore,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { type BlockInstance, InnerBlockTemplate } from '@wordpress/blocks';
import { useDispatch, useSelect } from '@wordpress/data';
import { Icon } from '@wordpress/components';
import { chevronDown } from '@wordpress/icons';
import { calcNewPosition, getLowestWidth } from '../utils';
import type { DropDownCoords, MenuItemAttributes } from './constants';

/**
 * Internal dependencies
 *
 * @param props
 * @param props.attributes
 * @param props.setAttributes
 * @param props.isSelected
 * @param props.onReplace
 * @param props.mergeBlocks
 * @param props.isParentOfSelectedBlock
 * @param props.hasDescendants
 * @param props.updateInnerBlocks
 * @param props.rootBlockClientId
 * @param props.parentAttributes
 * @param props.dispatch
 * @param props.clientId
 */
export default function Edit( props: {
	attributes: MenuItemAttributes;
	setAttributes: Function;
	isSelected: boolean;
	onReplace: ( blocks: BlockInstance< { [ k: string ]: any } >[] ) => void;
	mergeBlocks: ( forward: boolean ) => void;
	clientId: string;
} ): JSX.Element {
	const {
		clientId,
		attributes,
		setAttributes,
		isSelected,
		onReplace,
		mergeBlocks,
	} = props;
	// the menu item anchor data
	const { text, linkTarget, rel } = attributes;
	const linkProps = {
		...( linkTarget && { target: linkTarget } ),
		...( rel && { rel } ),
	};

	const [ showDropdown, setShowDropdown ] = useState( false );
	const { replaceInnerBlocks } = useDispatch( blockEditorStore );

	// the menu item ref
	const menuItemRef = useRef< HTMLDivElement | null >( null );
	const dropdownRef = useRef< HTMLDivElement | null >( null );

	const updateInnerBlocks = ( content: InnerBlockTemplate[] = [] ) => {
		return replaceInnerBlocks( clientId, content, false );
	};

	const {
		isParentOfSelectedBlock,
		hasDescendants,
		parentAttributes,
	}: {
		isParentOfSelectedBlock: boolean;
		hasDescendants: boolean;
		parentAttributes: any;
	} = useSelect( ( select, {} ) => {
		const {
			hasSelectedInnerBlock,
			getBlockCount,
			getBlockParentsByBlockName,
			getBlock,
		} = select( blockEditorStore ) as any;
		const isParentOfSelectedBlock = hasSelectedInnerBlock( clientId, true );
		const hasDescendants = !! getBlockCount( clientId );
		const rootBlockClientId = getBlockParentsByBlockName( clientId, [
			'megamenu/menu',
		] )[ 0 ];

		const parentBlock = getBlock( rootBlockClientId );
		const parentAttributes = parentBlock.attributes;

		return {
			isParentOfSelectedBlock,
			hasDescendants,
			parentAttributes,
		};
	}, [] );

	const [ dropdownPosition, setDropdownPosition ]: [
		DropDownCoords,
		Function,
	] = useState( {
		left: 0,
		width: 0,
		maxWidth: document.body.clientWidth,
	} );

	function setParentAttributes() {
		setAttributes( {
			parentAttributes: {
				align: parentAttributes.align,
				menusMinWidth: parentAttributes.menusMinWidth,
				hasDescendants,
			},
		} );
	}

	const addMenuItemDropdown = () => {
		if ( ! hasDescendants ) {
			// if there are no descendants, we can just replace the inner blocks
			updateInnerBlocks();
		}
		// then open the dropdown
		setShowDropdown( true );
	};

	const updateDropdownPosition = useCallback( () => {
		const megamenuItem = menuItemRef.current;

		const editorIframe: HTMLIFrameElement | null = document.querySelector(
			'.edit-site-visual-editor__editor-canvas'
		);
		const editorEl = editorIframe?.contentWindow?.document?.body;

		/** The block editor sizes */
		const megamenuBBox = (
			megamenuItem?.closest( '.wp-block-megamenu' ) as HTMLDivElement
		 )?.getBoundingClientRect();
		const blockBBox = megamenuItem?.getBoundingClientRect() as DOMRect;
		const dropdownEl = dropdownRef.current as HTMLDivElement;

		/* will return the size we can fit the dropdown in */
		const maxWidth = getLowestWidth(
			editorEl?.clientWidth,
			parentAttributes.dropdownMaxWidth
		);

		const newPosition = calcNewPosition(
			{
				editorBBox: editorEl?.getBoundingClientRect() as DOMRect,
				dropdownBBox: dropdownEl?.getBoundingClientRect(),
				blockBBox,
				megamenuBBox,
			},
			maxWidth,
			parentAttributes.expandDropdown
		);

		setDropdownPosition( newPosition );
	}, [] );

	useEffect( () => {
		if ( isSelected || isParentOfSelectedBlock ) {
			updateDropdownPosition();
			setParentAttributes();
			setShowDropdown(
				( isSelected || isParentOfSelectedBlock ) && hasDescendants
			);
			return;
		}
		setShowDropdown( false );
	}, [ isSelected, isParentOfSelectedBlock ] );

	useEffect( () => {
		const blockNode: HTMLElement | null = menuItemRef.current;

		if ( blockNode ) {
			blockNode.ownerDocument.defaultView?.addEventListener(
				'resize',
				updateDropdownPosition
			);
		}
	}, [] );

	const blockProps = useBlockProps();
	const innerBlockProps = useInnerBlocksProps( {
		className: 'wp-block-megamenu-item__dropdown',
		style: {
			left: ( dropdownPosition?.left || 0 ) + 'px',
			width:
				( dropdownPosition?.width || document.body.clientWidth ) + 'px',
			maxWidth:
				( dropdownPosition?.maxWidth || document.body.clientWidth ) +
				'px',
		},
		ref: dropdownRef,
	} );

	return (
		<div
			ref={ menuItemRef }
			className={ classnames( 'wp-block-megamenu-item', {
				'has-children': hasDescendants,
				'is-opened': showDropdown,
			} ) }
		>
			<Controls toggleItemDropdown={ addMenuItemDropdown } { ...props } />
			<a
				{ ...linkProps }
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
						{ ...blockProps }
						placeholder={ __( 'Add a menu item' ) }
						value={ text }
						onChange={ ( value ) =>
							setAttributes( { text: value } )
						}
						onReplace={ onReplace }
						onMerge={ mergeBlocks }
						identifier="content"
						tagName="span"
					/>
				</span>
				{ hasDescendants ? (
					<Icon
						icon={ chevronDown }
						className="wp-block-megamenu-item__toggle"
						aria-hidden="true"
						style={ {
							fill: 'currentColor',
						} }
					/>
				) : null }
			</a>
			{ showDropdown && <div { ...innerBlockProps } /> }
		</div>
	);
}
