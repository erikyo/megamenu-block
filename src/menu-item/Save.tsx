/**
 * WordPress dependencies
 */
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { Icon } from '@wordpress/components';
import { chevronDown } from '@wordpress/icons';
import classnames from 'classnames';
import { type BlockAttributes, type BlockEditProps } from '@wordpress/blocks';
import { MenuItemAttributes } from './types';
import { RichText } from '@wordpress/block-editor';

/**
 * Save function for rendering the block on the frontend.
 *
 * @param {BlockEditProps<BlockAttributes>} attributes - The attributes of the block to be saved.
 * @return {JSX.Element} The JSX element representing the saved block.
 */
export default function save({
	attributes,
}: BlockEditProps<BlockAttributes>): JSX.Element {
	const {
		url,
		target,
		rel,
		text,
		showOnMobile,
		parentAttributes,
		hasDescendants,
	} = attributes as MenuItemAttributes;
	const { menusMinWidth, align, expandDropdown } = parentAttributes ?? {
		menusMinWidth: undefined,
		align: undefined,
		expandDropdown: undefined,
	};

	const blockProps = useBlockProps.save({
		className: classnames('wp-block-megamenu-item', {
			'has-children': hasDescendants,
			'show-on-mobile': showOnMobile,
		}),
		style: {
			position: !expandDropdown ? 'relative' : undefined,
		},
	});

	const linkProps: { href: any; target?: any; rel?: any } = {
		href: url ? url : '#',
		target: target ? target : undefined,
		rel: rel ? rel : undefined,
	};

	return (
		<div {...blockProps}>
			<a
				{...linkProps}
				className={'wp-block-megamenu-item__link'}
				style={{
					minWidth: menusMinWidth ? `${menusMinWidth}px` : 'auto',
					justifyContent: align ? align : 'left',
				}}
			>
				<RichText.Content
					tagName="span"
					className={'wp-block-megamenu-item__text'}
					value={text}
				/>
				{hasDescendants && (
					<Icon
						style={{
							fill: 'currentColor',
						}}
						icon={chevronDown}
						className="wp-block-megamenu-item__toggle"
						aria-hidden="true"
					/>
				)}
			</a>
			{hasDescendants && (
				<div
					{...useInnerBlocksProps.save({
						className: 'wp-block-megamenu-item__dropdown',
					})}
				/>
			)}
		</div>
	);
}
