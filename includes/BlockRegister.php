<?php


namespace MegaMenuBlock;


class BlockRegister {

	public function __construct() {

		add_action( 'init', array( $this, 'register_blocks' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'register_blocks_assets' ) );
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_scripts' ) );
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_style' ) );
	}

	public function register_blocks() {

		include_once MEGAMENU_PATH . 'includes/blocks/AbstractBlock.php';
		include_once MEGAMENU_PATH . 'includes/blocks/MegaMenu.php';
		include_once MEGAMENU_PATH . 'includes/blocks/MegaMenuItem.php';

		new MegaMenu();
		new MegaMenuItem();
	}

	public function register_blocks_assets() {

		$asset = include MEGAMENU_PATH . 'build/editor.asset.php';

		wp_enqueue_script(
			'megamenu-block-editor',
			MEGAMENU_URL . 'build/editor.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);
	}

	public function enqueue_scripts() {
		$asset = include MEGAMENU_PATH . 'build/megamenu.asset.php';

		wp_enqueue_script( 'megamenu-block', MEGAMENU_URL . 'build/megamenu.js', $asset['dependencies'], MEGAMENU_VERSION, true );
	}

	public function enqueue_style() {
		wp_enqueue_style( 'megamenu-block', MEGAMENU_URL . 'build/style-megamenu.css', [], MEGAMENU_VERSION );
	}
}
