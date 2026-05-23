<?php
/**
 * Render callbacks for MegaMenu blocks.
 *
 * @package MegaMenu_Block
 */

defined( 'ABSPATH' ) || exit;

/**
 * Render callback for the megamenu/menu block.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block content.
 * @param WP_Block $block      Block instance.
 * @return string Rendered HTML.
 */
function render_megamenu_menu( $attributes, $content, $block ) {
	$block_lang           = $attributes['lang'] ?? 'en';
	$current_lang         = function_exists( 'pll_current_language' ) ? pll_current_language() : $block_lang;
	if ( empty( $current_lang ) ) {
		$current_lang = 'en';
	}

	$activator            = $attributes['activator'] ?? 'hover';
	$expand_dropdown      = $attributes['expandDropdown'] ?? true;
	$collapse_on_mobile   = $attributes['collapseOnMobile'] ?? true;
	$responsive_breakpoint = $attributes['responsiveBreakpoint'] ?? 1023;
	$dropdown_max_width   = $attributes['dropdownMaxWidth'] ?? 0;
	$menu_align           = $attributes['menuAlign'] ?? 'right';
	$hamburger_color      = $attributes['hamburgerColor'] ?? 'var(--wp--preset--color--black)';

	$classes = array(
		'wp-block-megamenu',
		'activator-' . $activator,
	);

	if ( $expand_dropdown ) {
		$classes[] = 'has-full-width-dropdown';
	}

	if ( $collapse_on_mobile ) {
		$classes[] = 'is-collapsible';
	}

	$class_string = esc_attr( implode( ' ', $classes ) );

	$wrapper_attrs = get_block_wrapper_attributes( array(
		'class' => $class_string,
		'data-responsive-breakpoint' => esc_attr( $responsive_breakpoint ),
		'data-dropdown-width' => esc_attr( $dropdown_max_width ),
		'data-activator' => esc_attr( $activator ),
	) );

	ob_start();
	?>
	<nav <?php echo $wrapper_attrs; ?>>
		<div class="wp-block-megamenu__content">
			<?php echo $content; ?>
		</div>
	</nav>
	<div class="wp-block-megamenu__toggle-wrapper align<?php echo esc_attr( $menu_align ); ?>">
		<button class="wp-block-megamenu__toggle hamburger" aria-label="Toggle megamenu" style="color: <?php echo esc_attr( $hamburger_color ); ?>;">
			<div></div>
		</button>
	</div>
	<?php
	return ob_get_clean();
}

/**
 * Render callback for the megamenu/menu-item block.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block content.
 * @param WP_Block $block      Block instance.
 * @return string Rendered HTML.
 */
function render_megamenu_menu_item( $attributes, $content, $block ) {
	$block_lang           = $attributes['lang'] ?? 'en';
	$current_lang         = function_exists( 'pll_current_language' ) ? pll_current_language() : $block_lang;
	if ( empty( $current_lang ) ) {
		$current_lang = 'en';
	}

	$url              = $attributes['url'] ?? '';
	$target           = $attributes['target'] ?? '';
	$rel              = $attributes['rel'] ?? '';
	$text             = $attributes['text'] ?? '';
	$show_on_mobile   = $attributes['showOnMobile'] ?? false;
	$has_descendants  = $attributes['hasDescendants'] ?? false;

	// Get context values from parent block
	$context          = $block->context ?? array();
	$menus_min_width  = $context['megamenu/menusMinWidth'] ?? 0;
	$align            = $context['megamenu/align'] ?? 'left';
	$expand_dropdown  = $context['megamenu/expandDropdown'] ?? true;

	$classes = array(
		'wp-block-megamenu-item',
	);

	if ( $has_descendants ) {
		$classes[] = 'has-children';
	}

	if ( $show_on_mobile ) {
		$classes[] = 'show-on-mobile';
	}

	$class_string = esc_attr( implode( ' ', $classes ) );

	$style = '';
	if ( ! $expand_dropdown ) {
		$style = 'position: relative;';
	}

	$wrapper_args = array(
		'class' => $class_string,
		'style' => $style,
	);

	$wrapper_attrs = get_block_wrapper_attributes( $wrapper_args );

	$link_style = '';
	if ( $menus_min_width ) {
		$link_style .= 'min-width: ' . intval( $menus_min_width ) . 'px;';
	}
	$link_style .= 'justify-content: ' . esc_attr( $align ) . ';';

	$href = $url ? esc_url( $url ) : '#';
	$target_attr = $target ? ' target="' . esc_attr( $target ) . '"' : '';
	$rel_attr = $rel ? ' rel="' . esc_attr( $rel ) . '"' : '';

	ob_start();
	?>
	<div <?php echo $wrapper_attrs; ?>>
		<a href="<?php echo $href; ?>"<?php echo $target_attr; ?><?php echo $rel_attr; ?> class="wp-block-megamenu-item__link" style="<?php echo esc_attr( $link_style ); ?>">
			<span class="wp-block-megamenu-item__text"><?php echo wp_kses_post( $text ); ?></span>
			<?php if ( $has_descendants ) : ?>
				<span class="wp-block-megamenu-item__toggle" aria-hidden="true" style="fill: currentColor;">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path></svg>
				</span>
			<?php endif; ?>
		</a>
		<?php if ( $has_descendants ) : ?>
			<div class="wp-block-megamenu-item__dropdown">
				<?php echo $content; ?>
			</div>
		<?php endif; ?>
	</div>
	<?php
	return ob_get_clean();
}
