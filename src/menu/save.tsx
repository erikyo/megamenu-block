/**
 * WordPress dependencies
 */
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import classnames from 'classnames';
import { __ } from '@wordpress/i18n';

export default function save( { attributes } ): JSX.Element {
	const saveBlockProps = useBlockProps.save();

	return (
		<>
			<nav
				className={ classnames(
					'wp-block-megamenu',
					`activator-${ attributes.activator }`,
					{
						[ `has-full-width-dropdown` ]:
							attributes.expandDropdown ||
							attributes.dropdownMaxWidth === 0,
						[ `is-collapsible` ]: attributes.collapseOnMobile,
					}
				) }
				data-responsive-breakpoint={ attributes.responsiveBreakpoint }
				data-dropdown-width={ attributes.dropdownMaxWidth }
			>
				<div
					className="wp-block-megamenu__content"
					{ ...saveBlockProps }
				>
					<InnerBlocks.Content />
				</div>
			</nav>
			<div
				className={ classnames(
					'wp-block-megamenu__toggle-wrapper',
					'is-hidden'
				) }
			>
				<button className="wp-block-megamenu__toggle hamburger">
					<div></div>
				</button>
			</div>
		</>
	);
}
