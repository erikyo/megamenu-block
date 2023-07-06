/**
 * WordPress dependencies
 */
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import classnames from 'classnames';

export default function save( { attributes } ): JSX.Element {
	const saveBlockProps = useBlockProps.save();

	return (
		<nav
			className={ classnames(
				'wp-block-megamenu',
				`activator-${ attributes.activator }`,
				{
					[ `has-full-width-dropdown` ]:
						attributes.expandDropdown ||
						Number( attributes.dropdownMaxWidth ) === 0,
					[ `has-menu-align-${ attributes.align }` ]:
						attributes.align,
				}
			) }
		>
			<div className="wp-block-megamenu__content" { ...saveBlockProps }>
				<InnerBlocks.Content />
			</div>
		</nav>
	);
}
