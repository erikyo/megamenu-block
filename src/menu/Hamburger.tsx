import classnames from 'classnames';

/**
 * Renders a Hamburger component with customizable responsiveness.
 *
 * @param {Object} props                    - An object containing optional properties:
 * @param          props.showResponsiveMenu showResponsiveMenu: A boolean to show/hide the responsive menu (default: false).
 * @return {JSX.Element} The rendered Hamburger component.
 */
export function Hamburger( props: {
	showResponsiveMenu?: boolean;
} ) {
	const {
		showResponsiveMenu = false,
	} = props;

	return (
		<div
			className={ classnames(
				'wp-block-megamenu__toggle-wrapper',
				{ 'is-hidden': ! showResponsiveMenu }
			) }
		>
			<button
				className="wp-block-megamenu__toggle hamburger"
				aria-label="Toggle megamenu"
			>
				<div></div>
			</button>
		</div>
	);
}
