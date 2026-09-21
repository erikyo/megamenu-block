import MegaMenu from '../frontend/MegaMenu';
import { generateRandomId } from '../utils';
import './style.scss';

declare global {
	interface Window {
		wpBlocks: {
			megamenu: Record< string, MegaMenu >;
		};
	}
}

document.addEventListener( 'DOMContentLoaded', (): void => {
	const megamenus = document.querySelectorAll( '.wp-block-megamenu' );

	if ( ! megamenus.length ) {
		return;
	}

	window.wpBlocks = window.wpBlocks || {};
	window.wpBlocks.megamenu = window.wpBlocks.megamenu || {};

	/**
	 * For each menu init the MegaMenu class
	 */
	for ( const menu of megamenus ) {
		if ( ! menu.id ) {
			menu.id = generateRandomId( 'megamenu-' );
		}
		window.wpBlocks.megamenu[ menu.id ] = new MegaMenu(
			menu as HTMLElement
		);
	}
} );
