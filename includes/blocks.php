<?php
/**
 * Block registration for MegaMenu blocks.
 *
 * @package MegaMenu_Block
 */

defined( 'ABSPATH' ) || exit;

/**
 * Register MegaMenu block types.
 */
function register_megamenu() {
	register_block_type( MEGAMENU_PATH . 'build/menu', array(
		'render_callback' => 'render_megamenu_menu',
	) );

	register_block_type( MEGAMENU_PATH . 'build/menu-item', array(
		'render_callback' => 'render_megamenu_menu_item',
	) );
}
add_action( 'init', 'register_megamenu' );
