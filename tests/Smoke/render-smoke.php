<?php
/**
 * Regression check for the server-rendered Mega Menu content wrapper.
 *
 * Run from the Mega Menu plugin root with:
 * php tests/Smoke/render-smoke.php
 */

declare( strict_types = 1 );

define( 'ABSPATH', __DIR__ );

function esc_attr( $value ): string {
	return htmlspecialchars( (string) $value, ENT_QUOTES, 'UTF-8' );
}

function wp_json_encode( $value ): string {
	return (string) json_encode( $value );
}

function get_block_wrapper_attributes( array $attributes = array() ): string {
	$attributes['class'] = trim( (string) ( $attributes['class'] ?? '' ) );
	$rendered = array();
	foreach ( $attributes as $name => $value ) {
		if ( '' !== $value ) {
			$rendered[] = sprintf( '%s="%s"', $name, esc_attr( $value ) );
		}
	}
	return implode( ' ', $rendered );
}

require_once dirname( __DIR__, 2 ) . '/includes/render.php';

$rendered = render_megamenu_menu( array(), '<div class="menu-item">Products</div>', null );

if ( false === strpos( $rendered, 'class="wp-block-megamenu__content"' ) ) {
	fwrite( STDERR, "Mega Menu content wrapper lost its base class.\n" );
	exit( 1 );
}

if ( false === strpos( $rendered, 'data-wp-class--is-opened="state.isMobileMenuOpen"' ) ) {
	fwrite( STDERR, "Mega Menu content wrapper must use a class toggle directive.\n" );
	exit( 1 );
}

if ( false !== strpos( $rendered, 'data-wp-bind--class' ) ) {
	fwrite( STDERR, "Mega Menu content wrapper must not replace its class attribute.\n" );
	exit( 1 );
}

echo "Mega Menu render smoke check passed.\n";
