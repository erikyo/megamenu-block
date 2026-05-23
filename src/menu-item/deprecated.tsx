import { useBlockProps, RichText, InnerBlocks } from '@wordpress/block-editor';
import classnames from 'classnames';
import blockMeta from './block.json';

const legacyAttributes = {
	...blockMeta.attributes,
	text: {
		type: 'string',
		source: 'html',
		selector: '.wp-block-megamenu-item__text',
		default: '',
	},
};

const deprecated = [
	{
		attributes: legacyAttributes,
		supports: { ...blockMeta.supports },
		migrate( attributes: any, innerBlocks: any ) {
			return [ attributes, innerBlocks ];
		},
		save( { attributes }: { attributes: any } ) {
			const { text, target, rel, hasDescendants, showOnMobile, parentAttributes } = attributes;
			const href = attributes.url ? attributes.url : '#';
			const targetAttr = target ? { target } : {};
			const relAttr = rel ? { rel } : {};

			// Preserve native spacing and custom classes
			const blockProps = useBlockProps.save({
				className: classnames('wp-block-megamenu-item', {
					'has-children': hasDescendants,
					'show-on-mobile': showOnMobile,
				})
			});

			// Reproduce the exact legacy inline link styling
			const linkStyle = {
				minWidth: parentAttributes?.menusMinWidth ? parentAttributes.menusMinWidth + 'px' : undefined,
				justifyContent: parentAttributes?.align ? parentAttributes.align : undefined,
			};

			return (
				<div { ...blockProps }>
					<a href={ href } { ...targetAttr } { ...relAttr } className="wp-block-megamenu-item__link" style={ linkStyle }>
						<RichText.Content value={ text } tagName="span" className="wp-block-megamenu-item__text" />
						{ hasDescendants && (
							<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" style={ { fill: 'currentColor' } } aria-hidden="true" className="wp-block-megamenu-item__toggle">
								<path d="M17.5 11.6L12 16l-5.5-4.4.9-1.2L12 14l4.5-3.6 1 1.2z"></path>
							</svg>
						) }
					</a>
					{ hasDescendants && (
						<div className="wp-block-megamenu-item__dropdown">
							<InnerBlocks.Content />
						</div>
					) }
				</div>
			);
		}
	}
];

export default deprecated;
