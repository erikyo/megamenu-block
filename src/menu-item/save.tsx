/**
 * WordPress dependencies
 */
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { Icon } from '@wordpress/components';
import { chevronDown } from '@wordpress/icons';
import classnames from 'classnames';

export default function save( { attributes } ) {
	const {
		url,
		linkTarget,
		rel,
		text,
		parentAttributes: { menuItemHasChildrens, menusMinWidth, align },
	} = attributes;

	const linkProps = {
		href: url ? url : '#',
		...( linkTarget && { target: linkTarget } ),
		...( rel && { rel } ),
	};

	const blockProps = useBlockProps.save( {
		className: classnames( 'wp-block-megamenu-item', {
			'has-children': menuItemHasChildrens || false,
			'has-full-width-dropdown':
				attributes.expandDropdown || menusMinWidth === 0,
		} ),
	} );

	return (
		<>
			<div { ...blockProps }>
				<a
					{ ...linkProps }
					className={ 'wp-block-megamenu-item__link' }
					style={ {
						minWidth: menusMinWidth ? menusMinWidth + 'px' : 'auto',
						justifyContent: align ? align : 'left',
					} }
				>
					{ text }
					{ menuItemHasChildrens && (
						<Icon
							color="var(--wp--preset--color--primary)"
							icon={ chevronDown }
							className="wp-block-megamenu-item__toggle"
						/>
					) }
				</a>
				<div className={ 'wp-block-megamenu-item__dropdown' }>
					<InnerBlocks.Content />
				</div>
			</div>
		</>
	);
}
