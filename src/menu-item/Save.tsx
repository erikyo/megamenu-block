/**
 * WordPress dependencies
 */
import { RichText } from '@wordpress/block-editor';

export default function Save( { attributes }: { attributes: any } ): JSX.Element {
	const { text, target, rel, hasDescendants } = attributes;

	const href = attributes.url ? attributes.url : '#';
	const targetAttr = target ? ` target="${ target }"` : '';
	const relAttr = rel ? ` rel="${ rel }"` : '';

	return (
		<div className="wp-block-megamenu-item">
			<a href={ href }{ ...targetAttr }{ ...relAttr } className="wp-block-megamenu-item__link">
				<RichText.Content value={ text } tagName="span" className="wp-block-megamenu-item__text" />
				{ hasDescendants && (
					<span className="wp-block-megamenu-item__toggle" aria-hidden="true" style={ { fill: 'currentColor' } }>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path></svg>
					</span>
				) }
			</a>
		</div>
	);
}