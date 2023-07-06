/**
 * WordPress dependencies
 */
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import classnames from 'classnames';

export default function save( { attributes } ): JSX.Element {
	const saveBlockProps = useBlockProps.save( {
		classNames: classnames(
			'wp-block-megamenu',
			`activator-${ attributes.activator }`,
			{
				[ `has-full-width-dropdown` ]:
					attributes.expandDropdown ||
					Number( attributes.dropdownMaxWidth ) === 0,
				[ `has-menu-align-${ attributes.align }` ]: attributes.align,
			}
		),
	} );

	return (
		<nav { ...saveBlockProps }>
			<div className={ 'wp-block-megamenu__wrapper' }>
				<div className="wp-block-megamenu__content">
					<InnerBlocks.Content />
				</div>
			</div>
		</nav>
	);
}
