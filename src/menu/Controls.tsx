import {
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { MegaMenuAttributes } from './types';

/**
 * Renders the controls for the MegaMenu block.
 *
 * @param {Object} props                       - The props object containing the following properties:
 * @param          props.showResponsiveMenu    showResponsiveMenu: A boolean indicating whether the responsive menu toggle is shown.
 * @param          props.setShowResponsiveMenu setShowResponsiveMenu: A function to toggle the visibility of the responsive menu toggle.
 * @param          props.setAttributes         setAttributes: A function to set the attributes of the block.
 * @param          props.attributes            attributes: The attributes of the block.
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
	} = attributes;

	return (
		<>
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
					title={ __( 'Menu Items Settings' ) }
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
					<ToggleControl
						label={ __( 'Collapse on mobile?' ) }
						help={
							collapseOnMobile
								? __(
										'Menu will collapse to a button on mobile.'
								  )
								: __( 'Menu will be as it is.' )
						}
						checked={ collapseOnMobile }
						onChange={ ( val ) =>
							setAttributes( { collapseOnMobile: val } )
						}
					/>
					{ collapseOnMobile ? (
						<>
							<ToggleControl
								label={ __( 'Show responsive Toggle' ) }
								help={
									showResponsiveMenu
										? __( 'Show hamburger.' )
										: __( 'Hide hamburger.' )
								}
								checked={ showResponsiveMenu }
								onChange={ () =>
									setShowResponsiveMenu(
										! showResponsiveMenu
									)
								}
							/>
							<RangeControl
								label={ __(
									'Mobile device breakpoint in pixels'
								) }
								value={ responsiveBreakpoint }
								onChange={ ( newValue ) =>
									setAttributes( { newValue } )
								}
								min={ 0 }
								max={ 2000 }
							/>
						</>
					) : null }
				</PanelBody>
			</InspectorControls>
		</>
	);
}
