import {
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	Toolbar,
	ToolbarButton,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { BlockControls, InspectorControls } from '@wordpress/block-editor';
import { alignCenter, alignLeft, alignRight } from '@wordpress/icons';
import { MegaMenuAttributes } from './types';

/**
 * Renders the controls for the MegaMenu block.
 *
 * @param {Object} props                       - The props object containing the following properties:
 *                                             - setAttributes: A function to set the attributes of the block.
 *                                             - attributes: The attributes of the block.
 *                                             - showResponsiveMenu: A boolean indicating whether the responsive menu toggle is shown.
 *                                             - setShowResponsiveMenu: A function to toggle the visibility of the responsive menu toggle.
 * @param          props.showResponsiveMenu
 * @param          props.setShowResponsiveMenu
 * @param          props.setAttributes
 * @param          props.attributes
 * @return {JSX.Element} The rendered controls.
 */
export function Controls( {
	setAttributes,
	attributes,
	showResponsiveMenu,
	setShowResponsiveMenu,
}: {
	showResponsiveMenu: boolean;
	setShowResponsiveMenu: Function;
	setAttributes: Function;
	attributes: MegaMenuAttributes;
} ): JSX.Element {
	const {
		menusMinWidth,
		activator,
		expandDropdown,
		collapseOnMobile,
		responsiveBreakpoint,
		dropdownMaxWidth,
		align,
	} = attributes;
	function setAlignment( newValue: string ) {
		setAttributes( {
			align: newValue,
		} );
	}

	return (
		<>
			<BlockControls>
				<Toolbar label="Options">
					<ToolbarButton
						icon={ alignLeft }
						label="Left"
						title={ __( 'Justify items left' ) }
						isActive={ 'left' === align }
						onClick={ () => setAlignment( 'left' ) }
					/>
					<ToolbarButton
						icon={ alignCenter }
						label="Center"
						title={ __( 'Justify items center' ) }
						isActive={ 'center' === align }
						onClick={ () => setAlignment( 'center' ) }
					/>
					<ToolbarButton
						icon={ alignRight }
						label="Right"
						title={ __( 'Justify items right' ) }
						isActive={ 'right' === align }
						onClick={ () => setAlignment( 'right' ) }
					/>
				</Toolbar>
			</BlockControls>
			<InspectorControls>
				<PanelBody
					title={ __( 'Menu Dropdown Settings' ) }
					initialOpen={ true }
				>
					<ToggleControl
						label={ __( 'Expand dropdown' ) }
						help={
							expandDropdown
								? __( 'Dropdown width same as window width.' )
								: __( 'Dropdown width same as menu width.' )
						}
						checked={ expandDropdown }
						onChange={ ( value ) =>
							setAttributes( {
								expandDropdown: value,
							} )
						}
					/>
					{ dropdownMaxWidth !== 0 && (
						<RangeControl
							label={ __(
								'Maximum width of dropdown in pixels'
							) }
							value={ dropdownMaxWidth }
							onChange={ ( newWidth ) =>
								setAttributes( { newWidth } )
							}
							min={ 0 }
							max={ 2000 }
						/>
					) }
					<SelectControl
						label={ __( 'Activator' ) }
						value={ activator }
						options={ [
							{ label: __( 'Click' ), value: 'click' },
							{ label: __( 'Hover' ), value: 'hover' },
						] }
						onChange={ ( newValue ) =>
							setAttributes( { activator: newValue } )
						}
						__nextHasNoMarginBottom
					/>
				</PanelBody>
				<PanelBody
					title={ __( 'Menu Item Settings' ) }
					initialOpen={ false }
				>
					<RangeControl
						label={ __( 'Minimum Width' ) }
						value={ menusMinWidth }
						onChange={ ( value ) =>
							setAttributes( { menusMinWidth: value } )
						}
						min={ 0 }
						max={ 1000 }
					/>
				</PanelBody>
				<PanelBody
					title={ __( 'Responsive Settings' ) }
					initialOpen={ false }
				>
					<RangeControl
						label={ __( 'Mobile device breakpoint in pixels' ) }
						value={ responsiveBreakpoint }
						onChange={ ( newValue ) =>
							setAttributes( { newValue } )
						}
						min={ 0 }
						max={ 2000 }
					/>
					<ToggleControl
						label={ __( 'Collapse on mobile?' ) }
						help={
							collapseOnMobile
								? __( 'Menu will be transformed to burger.' )
								: __( 'Menu will be as it is.' )
						}
						checked={ collapseOnMobile }
						onChange={ ( val ) => setAttributes( { val } ) }
					/>
					<ToggleControl
						label={ __( 'Show responsive Toggle' ) }
						help={
							showResponsiveMenu
								? __( 'Show hamburger.' )
								: __( 'Hide hamburger.' )
						}
						checked={ showResponsiveMenu }
						onChange={ () =>
							setShowResponsiveMenu( ! showResponsiveMenu )
						}
					/>
				</PanelBody>
			</InspectorControls>
		</>
	);
}
