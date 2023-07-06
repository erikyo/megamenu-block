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
		href: url ? url : false,
		...( linkTarget && { target: linkTarget } ),
		...( rel && { rel } ),
	};

	const blockProps = useBlockProps.save( {
		style: {
			minWidth: menusMinWidth ? menusMinWidth + 'px' : 'auto',
			textAlign: align ? align : 'left',
		},
		linkProps,
	} );

	return (
		<>
			<div
				className={ classnames( 'wp-block-megamenu-item', {
					'has-children': menuItemHasChildrens || false,
					'has-full-width-dropdown':
						attributes.expandDropdown || menusMinWidth === 0,
				} ) }
			>
				<div className={ 'wp-block-megamenu-item__link' }>
					<a { ...blockProps }>
						{ text }
						{ menuItemHasChildrens && (
							<Icon
								icon={ chevronDown }
								className="wp-block-megamenu-item__toggle"
							/>
						) }
					</a>
				</div>
				<div className={ 'wp-block-megamenu-item__dropdown' }>
					<InnerBlocks.Content />
				</div>
			</div>
		</>
	);
}
