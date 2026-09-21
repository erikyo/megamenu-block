/**
 * External dependencies
 */
import classnames from 'classnames';
/**
 * WP dependencies
 */
import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from '@wordpress/element';
import {
	RichText,
	store as blockEditorStore,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import {
	type BlockInstance,
	createBlocksFromInnerBlocksTemplate,
} from '@wordpress/blocks';
import { useDispatch, useSelect } from '@wordpress/data';
import { Icon } from '@wordpress/components';
import { chevronDown } from '@wordpress/icons';
/**
 * Internal dependencies
 */
import { DropDownCoords, MenuItemAttributes, ParentAttributes } from './types';
import { calcPosition } from '../utils';
import Controls from './Controls';
import { DROPDOWN_TEMPLATE } from '../utils/constants';
import './editor.scss';

/**
 * The Edit component.
 *
 * @param props               The component props.
 * @param props.attributes    The attributes of the block.
 * @param props.setAttributes A function to set the attributes.
 * @param props.isSelected    Whether the block is selected.
 * @param props.onReplace     A function to replace the block.
 * @param props.mergeBlocks   A function to merge blocks.
 * @param props.clientId      The clientId of the block.
 * @param props.context       The context of the block.
 */
export default function Edit( props: {
	attributes: MenuItemAttributes;
	setAttributes: Function;
	isSelected: boolean;
	onReplace: ( blocks: BlockInstance< { [ k: string ]: any } >[] ) => void;
	mergeBlocks: ( forward: boolean ) => void;
	clientId: string;
	context: {
		'megamenu/align': string;
		'megamenu/menusMinWidth': string;
		'megamenu/expandDropdown': boolean;
	};
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
	const { text, target, rel, parentAttributes, showOnMobile } = attributes;

	// Runtime-derived values from parent block context (with fallback to legacy parentAttributes if context is absent)
	const contextMenusMinWidth = props?.context?.[ 'megamenu/menusMinWidth' ];
	const contextExpandDropdown = props?.context?.[ 'megamenu/expandDropdown' ];

	const menusMinWidth =
		contextMenusMinWidth !== undefined
			? contextMenusMinWidth
			: parentAttributes?.menusMinWidth;
	const expandDropdown =
		contextExpandDropdown !== undefined
			? contextExpandDropdown
			: ( parentAttributes?.expandDropdown ?? true );

	const linkProps = {
		target: target ? target : undefined,
		rel: rel ? rel : undefined,
	};

	const [ dropdownPosition, setDropdownPosition ] = useState(
		{} as DropDownCoords
	);

	const [ showDropdown, setShowDropdown ] = useState( false );
	const { replaceInnerBlocks } = useDispatch( blockEditorStore );

	// the menu item ref
	const menuItemRef = useRef< HTMLElement | null >( null );
	const dropdownRef = useRef< HTMLElement | null >( null );

	const updateInnerBlocks = async ( content = DROPDOWN_TEMPLATE ) => {
		const innerBlocks = createBlocksFromInnerBlocksTemplate( content );
		return replaceInnerBlocks( clientId, innerBlocks, false );
	};

	const {
		isParentOfSelectedBlock,
		hasDescendants,
		innerBlocks,
	}: {
		isParentOfSelectedBlock: boolean;
		hasDescendants: boolean;
		innerBlocks: BlockInstance[];
	} = useSelect( ( select, {} ) => {
		const { hasSelectedInnerBlock, getBlockCount, getBlocks } = select(
			blockEditorStore
		) as any;

		return {
			isParentOfSelectedBlock: hasSelectedInnerBlock( clientId, true ),
			hasDescendants: !! getBlockCount( clientId ),
			innerBlocks: getBlocks( clientId ),
		};
	}, [ clientId ] );

	/**
	 * Synchronize hasDescendants only when the calculated state actually differs from the stored attribute.
	 * Opening the editor with an already-correct value will never invoke setAttributes.
	 */
	useEffect( () => {
		if ( attributes.hasDescendants !== hasDescendants ) {
			setAttributes( { hasDescendants } );
		}
	}, [ hasDescendants, attributes.hasDescendants, setAttributes ] );

	/**
	 * A function that adds a dropdown menu item.
	 *
	 * @return {void} No return value
	 */
	const addMenuItemDropdown = async (): Promise< void > => {
		if ( ! hasDescendants ) {
			// if there are no descendants, we need to update the inner blocks
			await updateInnerBlocks();
		}
		// then open the dropdown
		setShowDropdown( true );
	};

	/**
	 * Will update the position of the dropdown based on the position of the menu item
	 */
	const updateDropdownPosition = useCallback(
		( megamenuElements?: {
			megamenuItem: HTMLElement;
			dropdown?: HTMLElement;
			expandDropdown?: boolean;
		} ) => {
			const { megamenuItem, dropdown } = megamenuElements || {
				megamenuItem: menuItemRef.current ?? undefined,
				dropdown: dropdownRef.current ?? undefined,
			};

			// if the menu item or the dropdown doesn't exist, exit
			if ( ! megamenuItem || ! dropdown ) {
				setDropdownPosition( {} );
				return {};
			}

			const isExpanded =
				megamenuElements?.expandDropdown !== undefined
					? megamenuElements.expandDropdown
					: expandDropdown;

			// get the position of the menu item
			const newPosition = calcPosition(
				megamenuItem,
				dropdown,
				{ expandDropdown: isExpanded }
			);

			return newPosition;
		},
		[ expandDropdown ]
	);

	useEffect( () => {
		if ( isSelected || isParentOfSelectedBlock ) {
			setShowDropdown( hasDescendants );
			return;
		}
		setShowDropdown( false );
	}, [ isSelected, isParentOfSelectedBlock, hasDescendants ] );

	useLayoutEffect( () => {
		// Only calculate position if both refs are attached to DOM and dropdown is shown
		if ( menuItemRef.current && dropdownRef.current && showDropdown ) {
			// Ensure elements are actually in the DOM before calculating position
			const menuItem = menuItemRef.current;
			const dropdown = dropdownRef.current;
			
			// Check if elements are connected to the DOM (use ownerDocument for iframe context)
			const menuItemDoc = menuItem.ownerDocument;
			const dropdownDoc = dropdown.ownerDocument;
			
			if ( menuItemDoc?.body.contains( menuItem ) && dropdownDoc?.body.contains( dropdown ) ) {
				const newPosition = updateDropdownPosition( {
					megamenuItem: menuItem,
					dropdown: dropdown,
					expandDropdown,
				} );
				setDropdownPosition( newPosition );
			}
		}
	}, [ showDropdown, expandDropdown, updateDropdownPosition ] );

	/** on resize, update the position of the dropdown */
	useEffect( () => {
		const blockNode: HTMLElement | null = menuItemRef.current;

		if ( blockNode ) {
			const handleResize = () => {
				// Only update if both refs are available and dropdown is shown
				if ( menuItemRef.current && dropdownRef.current && showDropdown ) {
					const newPosition = updateDropdownPosition();
					setDropdownPosition( newPosition );
				}
			};

			const ownerWindow = blockNode.ownerDocument?.defaultView;
			window.addEventListener( 'resize', handleResize );
			if ( ownerWindow && ownerWindow !== window ) {
				ownerWindow.addEventListener( 'resize', handleResize );
			}

			return () => {
				window.removeEventListener( 'resize', handleResize );
				if ( ownerWindow && ownerWindow !== window ) {
					ownerWindow.removeEventListener( 'resize', handleResize );
				}
			};
		}
	}, [ showDropdown, updateDropdownPosition ] );

	/** the block */
	const blockProps = useBlockProps( {
		ref: menuItemRef,
		className: classnames( 'wp-block-megamenu-item', {
			'has-children': hasDescendants,
			'show-on-mobile': showOnMobile,
			'is-opened': showDropdown,
		} ),
		style: {
			minWidth: menusMinWidth ? `${ menusMinWidth }px` : 'auto',
			position: ! expandDropdown ? 'relative' : undefined,
		}
	} );
	/** the dropdown */
	const innerBlockProps = useInnerBlocksProps( {
		className: 'wp-block-megamenu-item__dropdown',
		style: dropdownPosition,
		ref: dropdownRef,
	} );

	return (
		<div { ...blockProps }>
			<Controls toggleItemDropdown={ addMenuItemDropdown } { ...props } />
			<span
				{ ...linkProps }
				className={ 'wp-block-megamenu-item__link' }
			>
				<RichText
					value={ text }
					allowedFormats={ [
						'core/bold',
						'core/italic',
						'core/language',
					] }
					placeholder={ __( 'Add a menu item' ) }
					className={ 'wp-block-megamenu-item__text' }
					onChange={ ( value ) => setAttributes( { text: value } ) }
					onReplace={ onReplace }
					onMerge={ mergeBlocks }
					tagName="span"
				/>
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
			</span>
			{ showDropdown && <div { ...innerBlockProps } /> }
		</div>
	);
}
