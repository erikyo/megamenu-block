<?php

namespace MegaMenuBlock;

class MegaMenu extends AbstractBlock {

	public function __construct() {
		parent::__construct();
	}

	public function render_callback( $attributes, $content ) {

		$collapse_on_mobile = ! isset( $attributes['collapseOnMobile'] ) || $attributes['collapseOnMobile'];

		$classes = array_merge(
			isset( $attributes['className'] ) ? array( $attributes['className'] ) : array(),
			isset( $attributes['align'] ) ? array( 'align' . $attributes['align'] ) : array(),
			isset( $attributes['activator'] ) ? array( 'activator-' . $attributes['activator'] ) : array(),
			! isset( $attributes['dropdownMaxWidth'] ) ? array( 'has-full-width-dropdown' ) : array(),
			$collapse_on_mobile ? array('is-collapsible') : array()
		);

		$html = sprintf(
			'<div class="wp-block-megamenu %s" data-responsive-breakpoint="%s">',
			implode( ' ', $classes ),
			$attributes['responsiveBreakpoint'] ?? MEGAMENU_RESPONSIVE_BREAKPOINT
		);

			if ( $collapse_on_mobile ) {
				$toggle_button_alignment_style = isset( $attributes['toggleButtonAlignment'] ) ? sprintf( 'style="text-align: %s;"', $attributes['toggleButtonAlignment'] ) : '';

				$button = sprintf( '<button class="wp-block-megamenu__toggle"><span class="dashicons dashicons-menu"></span>%s</button>', esc_html__( 'Menu', 'megamenu' ) );
				$html .= sprintf( '<div class="wp-block-megamenu__toggle-wrapper is-hidden" %s>%s</div>', $toggle_button_alignment_style, $button );
			}

			$html .= $content;

		$html .= '</div>';

		return $html;
	}

	protected function setName() {
		$this->name = 'megamenu/menu';
	}
}
