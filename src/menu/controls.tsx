import {
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	ToolbarButton,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { BlockControls, InspectorControls } from '@wordpress/block-editor';
import { compose } from '@wordpress/compose';
import { withDispatch } from '@wordpress/data';
import {
	alignJustify,
	alignLeft,
	alignCenter,
	alignRight,
} from '@wordpress/icons';

/**
 * The Megamenu editor controls
 *
 * @param args
 * @param args.setAttributes
 * @param args.attributes
 */
export function Controls( { setAttributes, attributes } ): JSX.Element {
	function expandDropdown( doExpand ) {
		setAttributes( {
			dropdownMaxWidth: doExpand ? 2000 : 0,
		} );
	}

	function setAlignment( newValue: string ) {
		setAttributes( {
			align: newValue,
		} );
	}

	return (
		<>
			<BlockControls>
				<ToolbarButton
					icon={ alignLeft }
					label="Left"
					title={ __( 'Justify items left' ) }
					isActive={ 'left' === attributes.align }
					onClick={ () => setAlignment( 'left' ) }
				/>
				<ToolbarButton
					icon={ alignCenter }
					label="Center"
					title={ __( 'Justify items center' ) }
					isActive={ 'center' === attributes.align }
					onClick={ () => setAlignment( 'center' ) }
				/>
				<ToolbarButton
					icon={ alignRight }
					label="Right"
					title={ __( 'Justify items right' ) }
					isActive={ 'right' === attributes.align }
					onClick={ () => setAlignment( 'right' ) }
				/>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={ __( 'Menu Dropdown Settings' ) } initialOpen={ true }>
					<ToggleControl
						label={ __( 'Expand dropdown' ) }
						help={
							attributes.dropdownMaxWidth === 0
								? __( 'Dropdown width same as window width.' )
								: __( 'Dropdown width same as menu width.' )
						}
						checked={ attributes.dropdownMaxWidth === 0 }
						onChange={ ( checked ) => expandDropdown( ! checked ) }
					/>
					{ attributes.dropdownMaxWidth !== 0 && (
						<RangeControl
							label={ __(
								'Maximum width of dropdown in pixels'
							) }
							value={ attributes.dropdownMaxWidth }
							onChange={ ( dropdownMaxWidth ) =>
								setAttributes( { dropdownMaxWidth } )
							}
							min={ 0 }
							max={ 2000 }
						/>
					) }
					<SelectControl
						label={ __( 'Activator' ) }
						value={ attributes.activator }
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
						value={ attributes.menusMinWidth }
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
						value={ attributes.responsiveBreakpoint }
						onChange={ ( responsiveBreakpoint ) =>
							setAttributes( { responsiveBreakpoint } )
						}
						min={ 0 }
						max={ 2000 }
					/>
					<ToggleControl
						label={ __( 'Collapse on mobile?' ) }
						help={
							attributes.collapseOnMobile
								? __( 'Menu will be transformed to burger.' )
								: __( 'Menu will be as it is.' )
						}
						checked={ attributes.collapseOnMobile }
						onChange={ ( collapseOnMobile ) =>
							setAttributes( { collapseOnMobile } )
						}
					/>
				</PanelBody>
			</InspectorControls>
		</>
	);
}

export default compose( [
	withDispatch( ( dispatch, ownProps, registry ) => ( {
		updateChildBlocksAttributes( attributes ) {
			const { updateBlockAttributes } = dispatch( 'core/block-editor' );
			const { getBlocksByClientId } =
				registry.select( 'core/block-editor' );

			const menuItems = getBlocksByClientId( ownProps.clientId )[ 0 ]
				.innerBlocks;

			menuItems.forEach( ( menuItem ) => {
				updateBlockAttributes( menuItem.clientId, {
					...attributes,
				} );
			} );
		},
	} ) ),
] as any )( Controls );
