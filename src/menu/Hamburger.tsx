import classnames from 'classnames';

/**
 * Renders a Hamburger component with customizable alignment, responsiveness, and color.
 *
 * @param {Object} props                    - An object containing optional properties:
 * @param          props.menuAlign          menuAlign: The alignment of the menu (default: 'right').
 * @param          props.showResponsiveMenu showResponsiveMenu: A boolean to show/hide the responsive menu (default: false).
 * @param          props.hamburgerColor     hamburgerColor: The color of the hamburger icon (default: 'currentColor').
 * @return {JSX.Element} The rendered Hamburger component.
 */
export function Hamburger( props: {
	menuAlign?: string;
	hamburgerColor?: string;
	showResponsiveMenu?: boolean;
} ) {
	const {
		menuAlign = 'right',
		hamburgerColor = 'currentColor',
		showResponsiveMenu = false,
	} = props;

	return (
		<div
			className={ classnames(
				'wp-block-megamenu__toggle-wrapper',
				{ 'is-hidden': ! showResponsiveMenu },
				`align${ menuAlign || 'right' }`
			) }
		>
			<button
				className="wp-block-megamenu__toggle hamburger"
				aria-label="Toggle megamenu"
				style={ { color: hamburgerColor } }
			>
				<div></div>
			</button>
		</div>
	);
}
