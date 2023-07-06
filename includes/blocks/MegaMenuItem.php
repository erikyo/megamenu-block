<?php


namespace MegaMenuBlock;


class MegaMenuItem extends AbstractBlock {

	public function __construct() {
		parent::__construct();
	}

	public function render_callback( $attributes, $content ) {
		return $content;
	}

	protected function setName() {
		$this->name = 'megamenu/menu-item';
	}
}
