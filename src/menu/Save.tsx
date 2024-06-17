/**
 * WordPress dependencies
 */
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import classnames from 'classnames';
import { MegaMenuAttributes } from './types';
import { Hamburger } from './Hamburger';

export default function Save( {
	attributes,
}: {
	attributes: MegaMenuAttributes;
} ): JSX.Element {
	const {
		activator,
		expandDropdown,
		collapseOnMobile,
		responsiveBreakpoint,
		dropdownMaxWidth,
		menuAlign,
		hamburgerColor,
	} = attributes;
	return (
		<>
			<nav
				{ ...useBlockProps.save( {
					className: classnames(
						'wp-block-megamenu',
						`activator-${ activator }`,
						{
							[ `has-full-width-dropdown` ]: expandDropdown,
							[ `is-collapsible` ]: collapseOnMobile,
						}
					),
				} ) }
				data-responsive-breakpoint={ responsiveBreakpoint }
				data-dropdown-width={ dropdownMaxWidth }
				data-activator={ activator }
			>
				<div
					{ ...useInnerBlocksProps.save( {
						className: classnames( 'wp-block-megamenu__content' ),
					} ) }
				/>
			</nav>
			<Hamburger
				hamburgerColor={ hamburgerColor }
				menuAlign={ menuAlign }
				showResponsiveMenu={ false }
			/>
		</>
	);
}
