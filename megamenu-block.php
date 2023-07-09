<?php

/**
 * Plugin Name: Navigation Block with Mega Menu
 * Plugin URI: https://motopress.com/products/wordpress-mega-menu-block/
 * Description: Build better navigation menus with the WordPress mega menu blocks.
 * Version: 1.0.5
 * Author: MotoPress, erikyo
 * Author URI: https://motopress.com/
 * License: GPLv2 or later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: megamenu
 */

defined( 'ABSPATH' ) || exit;

define( 'MEGAMENU_VERSION', '9999.0.5' );

define( 'MEGAMENU_FILE', __FILE__ );
define( 'MEGAMENU_PATH', plugin_dir_path( MEGAMENU_FILE ) );
define( 'MEGAMENU_URL', plugin_dir_url( MEGAMENU_FILE ) );

if ( ! function_exists( 'megamenu_init' ) && function_exists( 'register_block_type' ) ) {
	function megamenu_init() {
		include_once MEGAMENU_PATH . 'includes/BlockRegister.php';
		new MegaMenuBlock\BlockRegister();
	}

	megamenu_init();
}
