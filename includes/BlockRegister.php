<?php


namespace GetwidMegaMenu;


class BlockRegister {

	public function __construct() {
		$this->load_blocks();
		add_action( 'init', [ $this, 'register_blocks' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_frontend_assets' ] );
	}

	private function register_blocks_assets() {

		$asset = include GETWID_MEGAMENU_PATH . 'build/index.asset.php';

		wp_register_script(
			'getwid-megamenu-block',
			plugins_url( 'build/index.js', GETWID_MEGAMENU_FILE ),
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_register_style(
			'getwid-megamenu-block-editor',
			plugins_url( 'build/index.css', GETWID_MEGAMENU_FILE ),
			[],
			GETWID_MEGAMENU_VERSION
		);

		wp_register_style(
			'getwid-megamenu-block-style',
			plugins_url( 'build/style-index.css', GETWID_MEGAMENU_FILE ),
			['dashicons'],
			GETWID_MEGAMENU_VERSION
		);
	}

	private function load_blocks() {
		include_once( plugin_dir_path( GETWID_MEGAMENU_FILE ) . 'includes/blocks/AbstractBlock.php' );
		include_once( plugin_dir_path( GETWID_MEGAMENU_FILE ) . 'includes/blocks/MegaMenu.php' );
		include_once( plugin_dir_path( GETWID_MEGAMENU_FILE ) . 'includes/blocks/MegaMenuItem.php' );
		include_once( plugin_dir_path( GETWID_MEGAMENU_FILE ) . 'includes/blocks/PlainMenu.php' );
		include_once( plugin_dir_path( GETWID_MEGAMENU_FILE ) . 'includes/blocks/PlainMenuItem.php' );
	}

	public function register_blocks() {
		$this->register_blocks_assets();

		new MegaMenu();
		new MegaMenuItem();
		new PlainMenu();
		new PlainMenuItem();
	}

	public function enqueue_frontend_assets() {
		$asset = include GETWID_MEGAMENU_PATH . 'build/frontend.asset.php';

		wp_enqueue_script( 'getwid-megamenu-block-frontend', plugins_url( 'build/frontend.js', GETWID_MEGAMENU_FILE ), $asset['dependencies'], GETWID_MEGAMENU_VERSION, true );
	}
}
