<?php
/**
 * Plugin Name: MegaMenu Block
 * Plugin URI: https://motopress.com/products/wordpress-mega-menu-block/
 * Description: Build better navigation menus with the WordPress mega menu blocks.
 * Version: 2.1.0
 * Author: MotoPress, erikyo
 * Author URI: https://motopress.com/
 * License: GPLv2 or later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: megamenu
 * Domain Path: languages/
 */

defined( 'ABSPATH' ) || exit;

define( 'MEGAMENU_FILE', __FILE__ );

/**
 * Render callback for the megamenu/menu block.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block content.
 * @param WP_Block $block      Block instance.
 * @return string Rendered HTML.
 */
function render_megamenu_menu( $attributes, $content, $block ) {
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
	$url              = $attributes['url'] ?? '';
	$target           = $attributes['target'] ?? '';
	$rel              = $attributes['rel'] ?? '';
	$text             = $attributes['text'] ?? '';
	$show_on_mobile   = $attributes['showOnMobile'] ?? false;
	$has_descendants  = $attributes['hasDescendants'] ?? false;
	$submenu_id       = $attributes['submenuId'] ?? 0;

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

	if ( $submenu_id ) {
		$wrapper_args['data-submenu-id'] = intval( $submenu_id );
	}

	// Add Polylang language context if available
	$current_lang = function_exists( 'pll_current_language' ) ? pll_current_language() : '';
	if ( $current_lang ) {
		$wrapper_args['data-lang'] = esc_attr( $current_lang );
	}

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
			<div class="wp-block-megamenu-item__dropdown"></div>
		<?php endif; ?>
	</div>
	<?php
	return ob_get_clean();
}

/**
 * Register the megamenu_submenu custom post type.
 */
function register_megamenu_submenu_cpt() {
	$labels = array(
		'name'                  => 'MegaMenu Submenus',
		'singular_name'         => 'MegaMenu Submenu',
		'menu_name'             => 'MegaMenu Submenus',
		'add_new_item'          => 'Add New Submenu',
		'edit_item'             => 'Edit Submenu',
		'new_item'              => 'New Submenu',
		'view_item'             => 'View Submenu',
		'search_items'          => 'Search Submenus',
		'not_found'             => 'No submenus found',
		'not_found_in_trash'    => 'No submenus found in Trash',
	);

	$args = array(
		'labels'              => $labels,
		'public'              => false,
		'show_ui'             => true,
		'show_in_rest'        => true,
		'show_in_menu'        => true,
		'show_in_admin_bar'   => true,
		'show_in_nav_menus'   => false,
		'can_export'          => true,
		'has_archive'         => false,
		'exclude_from_search' => true,
		'publicly_queryable'  => false,
		'capability_type'     => 'post',
		'supports'            => array( 'title', 'editor', 'revisions' ),
		'menu_icon'           => 'dashicons-menu',
	);

	register_post_type( 'megamenu_submenu', $args );
}
add_action( 'init', 'register_megamenu_submenu_cpt' );

/**
 * REST API callback to fetch and render megamenu submenu content.
 *
 * @param WP_REST_Request $request The REST request object.
 * @return WP_REST_Response|WP_Error The response object or error.
 */
function megamenu_get_submenu_content( $request ) {
	global $wpdb;
	$post_id = intval( $request->get_param( 'id' ) );

	$post = $wpdb->get_row( $wpdb->prepare(
		"SELECT post_content, post_type FROM $wpdb->posts WHERE ID = %d",
		$post_id
	) );

	if ( ! $post || $post->post_type !== 'megamenu_submenu' ) {
		return new WP_Error(
			'megamenu_submenu_not_found',
			'Submenu not found',
			array( 'status' => 404 )
		);
	}

	// Get the raw content and process blocks
	$raw_content = $post->post_content;
	$rendered_html = do_blocks( $raw_content );

	return rest_ensure_response( array(
		'html' => $rendered_html,
	) );
}

/**
 * Register the REST API route for fetching submenu content.
 */
function register_megamenu_rest_routes() {
	register_rest_route(
		'megamenu/v1',
		'/submenu/(?P<id>[0-9]+)',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'megamenu_get_submenu_content',
			'permission_callback' => '__return_true',
		)
	);
}
add_action( 'rest_api_init', 'register_megamenu_rest_routes' );

function register_megamenu() {
	register_block_type( __DIR__ . '/build/menu', array(
		'render_callback' => 'render_megamenu_menu',
	) );

	register_block_type( __DIR__ . '/build/menu-item', array(
		'render_callback' => 'render_megamenu_menu_item',
	) );
}
add_action( 'init', 'register_megamenu' );
