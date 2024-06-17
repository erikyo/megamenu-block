import { useCallback, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	__experimentalLinkControl as LinkControl,
	BlockControls,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	Popover,
	TextControl,
	ToggleControl,
	Toolbar,
	ToolbarButton,
} from '@wordpress/components';
import { escapeHtml } from '../utils';
import { NEW_TAB_REL } from '../utils/constants';
import { MenuItemAttributes } from './types';

/**
 * Controls component for managing link settings.
 *
 * @param {Object} props                    - The properties object containing attributes, setAttributes, and toggleItemDropdown.
 * @param          props.attributes
 * @param          props.setAttributes
 * @param          props.toggleItemDropdown
 * @param          props.clientId
 * @return {JSX.Element} The JSX for link control and settings.
 */
export default function Controls( props: {
	attributes: MenuItemAttributes;
	setAttributes: ( attributes: Partial< MenuItemAttributes > ) => void;
	toggleItemDropdown: () => void;
	clientId: string;
} ) {
	const { attributes, setAttributes, toggleItemDropdown } = props;

	const { target, rel, text, type, url, showOnMobile, hasDescendants } =
		attributes;
	const [ isURLPickerOpen, setIsURLPickerOpen ] = useState( false );

	const isURLSet = ! ( url === undefined || url.trim().length === 0 );

	/**
	 * A function to open the link control.
	 *
	 * @return {boolean} False value is returned.
	 */
	const openLinkControl = () => {
		setIsURLPickerOpen( true );
		return false;
	};

	/**
	 * A function to unlink an item by setting URL, link target, and rel to undefined and closing the URL picker.
	 *
	 * @return {void} No return value
	 */
	const unlinkItem = () => {
		setAttributes( {
			url: undefined,
			target: undefined,
			rel: undefined,
		} );
		setIsURLPickerOpen( false );
	};

	/**
	 * Toggle the `linkTarget` attribute of the item.
	 */
	const onToggleOpenInNewTab = useCallback(
		( value: boolean ) => {
			const newLinkTarget = value ? '_blank' : undefined;

			let updatedRel = rel;
			if ( newLinkTarget && ! rel ) {
				updatedRel = NEW_TAB_REL;
			} else if ( ! newLinkTarget && rel === NEW_TAB_REL ) {
				updatedRel = undefined;
			}

			setAttributes( {
				target: newLinkTarget,
				rel: updatedRel,
			} );
		},
		[ rel, setAttributes ]
	);

	const memoizedValue = useMemo(
		() => ( {
			url,
			type,
			opensInNewTab: target === '_blank',
			title: text,
		} ),
		[ url, type, target, text ]
	);

	/**
	 * Will set the `rel` attribute of the item.
	 */
	const onSetLinkRel = useCallback(
		( value: string ) => {
			setAttributes( { rel: value } );
		},
		[ setAttributes ]
	);

	return (
		<>
			<BlockControls>
				<Toolbar label="Options">
					<ToolbarButton
						icon="admin-links"
						title={ __( 'Edit Link' ) }
						onClick={ openLinkControl }
						isActive={ isURLSet }
					/>
					<ToolbarButton
						icon="editor-unlink"
						title={ __( 'Unlink' ) }
						onClick={ unlinkItem }
						isDisabled={ ! isURLSet }
					/>
					<ToolbarButton
						icon={ 'download' }
						disabled={ hasDescendants }
						title={ __( 'Add submenu' ) }
						onClick={ toggleItemDropdown }
					/>
				</Toolbar>
			</BlockControls>
			{ isURLPickerOpen && (
				<Popover
					position="top center"
					onClose={ () => setIsURLPickerOpen( false ) }
				>
					<LinkControl
						value={ memoizedValue }
						onChange={ ( {
							text: newText = '',
							url: newURL = '',
							opensInNewTab: newOpensInNewTab = false,
							type: newtype,
						} ) => {
							setAttributes( {
								type: newtype,
								url: newURL,
								text:
									newText !== '' && newText !== newText
										? escapeHtml( newText )
										: '',
							} );

							if (
								( target === '_blank' ) !==
								newOpensInNewTab
							) {
								onToggleOpenInNewTab( newOpensInNewTab );
							}

							setIsURLPickerOpen( false );
						} }
					/>
				</Popover>
			) }
			<InspectorControls>
				<PanelBody title={ __( 'Link settings' ) }>
					<ToggleControl
						label={ __( 'Open in new tab' ) }
						onChange={ onToggleOpenInNewTab }
						checked={ target === '_blank' }
					/>
					<TextControl
						label={ __( 'Link rel' ) }
						value={ rel || '' }
						onChange={ onSetLinkRel }
					/>
					<ToggleControl
						label={ __( 'Display this item only on mobile' ) }
						checked={ showOnMobile }
						onChange={ ( value ) =>
							setAttributes( { showOnMobile: value } )
						}
					/>
				</PanelBody>
			</InspectorControls>
		</>
	);
}
