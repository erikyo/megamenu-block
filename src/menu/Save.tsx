/**
 * WordPress dependencies
 */
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import classnames from 'classnames';
import { MegaMenuAttributes } from './types';

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
			<div
				className={ classnames(
					'wp-block-megamenu__toggle-wrapper',
					'is-hidden'
				) }
				style={{ color: hamburgerColor }}
			>
				<button
					className="wp-block-megamenu__toggle hamburger"
					aria-label="Toggle megamenu"
				>
					<div></div>
				</button>
			</div>
		</>
	);
}
