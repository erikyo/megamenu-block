/**
 * WordPress dependencies
 */
import {
	InnerBlocks,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { Icon } from '@wordpress/components';
import { chevronDown } from '@wordpress/icons';
import classnames from 'classnames';
import { type BlockAttributes, type BlockEditProps } from '@wordpress/blocks';
import { MenuItemAttributes } from './constants';

export default function save({ attributes }: BlockEditProps<BlockAttributes>) {
	const { url, linkTarget, rel, text, parentAttributes, hasDescendants } =
		attributes as MenuItemAttributes;
	const { menusMinWidth, align, expandDropdown } = parentAttributes ?? {
		menusMinWidth: undefined,
		align: undefined,
		expandDropdown: undefined,
	};

	const blockProps = useBlockProps.save({
		className: classnames('wp-block-megamenu-item', {
			'has-children': hasDescendants,
		}),
		style: {
			position: !expandDropdown ? 'relative' : undefined,
		},
	});
	const linkProps = {
		href: url ? url : '#',
		...(linkTarget && { target: linkTarget }),
		...(rel && { rel }),
	};

	return (
		<div {...blockProps}>
			<a
				{...linkProps}
				className={'wp-block-megamenu-item__link'}
				style={{
					minWidth: menusMinWidth ? menusMinWidth + 'px' : 'auto',
					justifyContent: align ? align : 'left',
				}}
			>
				<span className={'wp-block-megamenu-item__text'}>{text}</span>
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
