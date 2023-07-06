<?php


namespace MegaMenuBlock;


abstract class AbstractBlock {

	protected $name;

	public function __construct() {
		$this->setName();
		$this->register();
	}

	/**
	 * Registers all block assets so that they can be enqueued through Gutenberg in
	 * the corresponding context.
	 */
	public function register() {
		register_block_type(
			$this->name,
			[
				'render_callback' => [$this, 'render_callback']
			]
		);
	}

	/**
	 * This function is called when the block is being rendered on the front end of the site
	 *
	 * @param array    $attributes     The array of attributes for this block.
	 * @param string   $content        Rendered block output. ie. <InnerBlocks.Content />.
	 */
	public function render_callback($attributes, $content) {
		return $content;
	}

}
