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
define( 'MEGAMENU_PATH', plugin_dir_path( __FILE__ ) );

require_once MEGAMENU_PATH . 'includes/render.php';
require_once MEGAMENU_PATH . 'includes/blocks.php';
