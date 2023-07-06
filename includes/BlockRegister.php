<?php


namespace MegaMenuBlock;


class BlockRegister {

	public function __construct() {
		$this->load_blocks();
		add_action( 'init', array( $this, 'register_blocks' ) );
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_assets' ) );
	}

	private function register_blocks_assets() {

		$asset = include MEGAMENU_PATH . 'build/editor.asset.php';

		wp_enqueue_script(
			'megamenu-block-editor',
			MEGAMENU_URL . 'build/editor.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);
	}

	private function load_blocks() {
		include_once MEGAMENU_PATH . 'includes/blocks/AbstractBlock.php';
		include_once MEGAMENU_PATH . 'includes/blocks/MegaMenu.php';
		include_once MEGAMENU_PATH . 'includes/blocks/MegaMenuItem.php';
	}

	public function register_blocks() {
		$this->register_blocks_assets();

		new MegaMenu();
		new MegaMenuItem();
	}

	public function enqueue_assets() {
		$asset = include MEGAMENU_PATH . 'build/megamenu.asset.php';

		wp_enqueue_script( 'megamenu-block', MEGAMENU_URL . 'build/megamenu.js', $asset['dependencies'], MEGAMENU_VERSION, true );

		wp_enqueue_style( 'megamenu-block', MEGAMENU_URL . 'build/style-megamenu.css', [], MEGAMENU_VERSION );
	}
}
