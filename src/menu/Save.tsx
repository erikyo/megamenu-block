/**
 * WordPress dependencies
 */
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import classnames from 'classnames';
import { MegaMenuAttributes } from './constants';

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
	} = attributes;
	return (
		<>
			<nav
				{ ...useBlockProps.save( {
					className: classnames(
						'wp-block-megamenu__content',
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
			>
				<InnerBlocks.Content />
			</nav>
			<div
				className={ classnames(
					'wp-block-megamenu__toggle-wrapper',
					'is-hidden'
				) }
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
