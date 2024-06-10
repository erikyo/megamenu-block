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
import {
	type BlockInstance,
	createBlocksFromInnerBlocksTemplate,
	type InnerBlockTemplate,
} from '@wordpress/blocks';
import { useDispatch, useSelect } from '@wordpress/data';
import { Icon } from '@wordpress/components';
import { chevronDown } from '@wordpress/icons';
import {
	DropDownCoords,
	MenuItemAttributes,
	ParentAttributes,
	TEMPLATE,
} from './constants';
import { calcPosition } from '../utils';

/**
 * Internal dependencies
 *
 * @param props
 * @param props.attributes
 * @param props.setAttributes
 * @param props.isSelected
 * @param props.onReplace
 * @param props.mergeBlocks
 * @param props.clientId
 * @param props.context
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
	const { text, linkTarget, rel, parentAttributes, showOnMobile } =
		attributes;
	const align = props?.context[ 'megamenu/align' ];
	const menusMinWidth = props?.context[ 'megamenu/menusMinWidth' ];
	const expandDropdown = props?.context[ 'megamenu/expandDropdown' ];

	const linkProps = {
		...( linkTarget && { target: linkTarget } ),
		...( rel && { rel } ),
	};

	const [ dropdownPosition, setDropdownPosition ] = useState(
		{} as DropDownCoords
	);

	const [ showDropdown, setShowDropdown ] = useState( false );
	const { replaceInnerBlocks } = useDispatch( blockEditorStore );

	// the menu item ref
	const menuItemRef = useRef< HTMLElement | null >( null );
	const dropdownRef = useRef< HTMLElement | null >( null );

	const updateInnerBlocks = async ( content = TEMPLATE ) => {
		return replaceInnerBlocks( clientId, [], false );
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

	/* will update the position of the dropdown based on the position of the menu item */
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

	const blockProps = useBlockProps();
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
				position: ! parentAttributes.expandDropdown
					? 'relative'
					: undefined,
			} }
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
