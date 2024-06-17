/**
 * External dependencies
 */
import classnames from 'classnames';
/**
 * WP dependencies
 */
import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
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
	const align = props?.context[ 'megamenu/align' ];
	const menusMinWidth = props?.context[ 'megamenu/menusMinWidth' ];
	const expandDropdown = props?.context[ 'megamenu/expandDropdown' ];

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
	}: {
		isParentOfSelectedBlock: boolean;
		hasDescendants: boolean;
	} = useSelect( ( select, {} ) => {
		const { hasSelectedInnerBlock, getBlockCount } = select(
			blockEditorStore
		) as any;

		return {
			isParentOfSelectedBlock: hasSelectedInnerBlock( clientId, true ),
			hasDescendants: !! getBlockCount( clientId ),
		};
	}, [] );

	/**
	 * A function that sets the attributes of the parent element.
	 *
	 * @return {void} No return value
	 */
	function setParentAttributes(): void {
		setAttributes( {
			hasDescendants,
			clientId,
			parentAttributes: {
				align,
				menusMinWidth,
				expandDropdown,
			},
		} );
	}

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
			parentAttributes?: ParentAttributes;
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

			// get the position of the menu item
			const newPosition = calcPosition(
				megamenuItem,
				dropdown,
				parentAttributes
			);

			return newPosition;
		},
		[ parentAttributes ]
	);

	useEffect( () => {
		if ( isSelected || isParentOfSelectedBlock ) {
			setParentAttributes();
			setShowDropdown( hasDescendants );
			return;
		}
		setShowDropdown( false );
	}, [ isSelected, isParentOfSelectedBlock ] );

	useEffect( () => {
		if ( menuItemRef.current ) {
			const newPosition = updateDropdownPosition( {
				megamenuItem: menuItemRef.current,
				dropdown: dropdownRef.current ?? undefined,
				parentAttributes,
			} );
			setDropdownPosition( newPosition );
		}
	}, [ showDropdown, parentAttributes ] );

	/** on resize, update the position of the dropdown */
	useEffect( () => {
		setParentAttributes();
		const blockNode: HTMLElement | null = menuItemRef.current;

		if ( blockNode ) {
			document?.addEventListener( 'resize', () => {
				const newPosition = updateDropdownPosition();
				setDropdownPosition( newPosition );
				setShowDropdown( false );
			} );
		}
	}, [] );

	/** the block */
	const blockProps = useBlockProps();
	/** the dropdown */
	const innerBlockProps = useInnerBlocksProps( {
		className: 'wp-block-megamenu-item__dropdown',
		style: dropdownPosition,
		ref: dropdownRef,
	} );

	return (
		<div
			ref={ menuItemRef as any }
			className={ classnames( 'wp-block-megamenu-item', {
				'has-children': hasDescendants,
				'show-on-mobile': showOnMobile,
				'is-opened': showDropdown,
			} ) }
			style={ {
				minWidth: parentAttributes.menusMinWidth
					? parentAttributes.menusMinWidth + 'px'
					: 'auto',
				position: ! parentAttributes.expandDropdown
					? 'relative'
					: undefined,
			} }
		>
			<Controls toggleItemDropdown={ addMenuItemDropdown } { ...props } />
			<span
				{ ...linkProps }
				className={ 'wp-block-megamenu-item__link' }
				style={ {
					justifyContent: parentAttributes.align
						? parentAttributes.align
						: 'left',
				} }
			>
				<RichText
					{ ...blockProps }
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
