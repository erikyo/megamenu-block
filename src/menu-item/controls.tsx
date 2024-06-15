import { useCallback, useState } from '@wordpress/element';
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

const NEW_TAB_REL = 'noreferrer noopener';

function Controls( props ) {
	const { attributes, setAttributes, toggleItemDropdown } = props;

	const { linkTarget, rel, text, url, showOnMobile, hasDescendants } =
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
			linkTarget: undefined,
			rel: undefined,
		} );
		setIsURLPickerOpen( false );
	};

	/**
	 * Toggle the `linkTarget` attribute of the item.
	 */
	const onToggleOpenInNewTab = useCallback(
		( value ) => {
			const newLinkTarget = value ? '_blank' : undefined;

			let updatedRel = rel;
			if ( newLinkTarget && ! rel ) {
				updatedRel = NEW_TAB_REL;
			} else if ( ! newLinkTarget && rel === NEW_TAB_REL ) {
				updatedRel = undefined;
			}

			setAttributes( {
				linkTarget: newLinkTarget,
				rel: updatedRel,
			} );
		},
		[ rel, setAttributes ]
	);

	/**
	 * Will set the `rel` attribute of the item.
	 */
	const onSetLinkRel = useCallback(
		( value ) => {
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
						value={ {
							url,
							opensInNewTab: linkTarget === '_blank',
						} }
						onChange={ ( {
							title: newTitle = '',
							url: newURL = '',
							opensInNewTab: newOpensInNewTab = false,
							id: newId = '',
							kind: newKind = '',
						} ) => {
							setAttributes( {
								id: newId,
								kind: newKind,
								url: newURL,
								text: ( () => {
									if ( text ) {
										return text;
									}
									if (
										newTitle !== '' &&
										text !== newTitle
									) {
										return escapeHtml( newTitle );
									}
								} )(),
							} );

							if (
								( linkTarget === '_blank' ) !==
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
						checked={ linkTarget === '_blank' }
					/>
					<TextControl
						label={ __( 'Link rel' ) }
						value={ rel || '' }
						onChange={ onSetLinkRel }
					/>
					<ToggleControl
						label={ __( 'Show on mobile' ) }
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

export default Controls;
