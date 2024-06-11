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

/* The code is adding an event listener to the `DOMContentLoaded` event, which is fired when the
initial HTML document has been completely loaded and parsed. When this event is triggered, the code
selects all elements with the class `wp-block-megamenu` using
`document.querySelectorAll('.wp-block-megamenu')`. It then iterates over each of these elements
using the `forEach` method and calls the `initMegamenu` function for each element. This function
initializes the mega menu by attaching event listeners and updating the menu's responsive behavior. */
document.addEventListener( 'DOMContentLoaded', (): void => {
	const megamenus = document.querySelectorAll( '.wp-block-megamenu' );

	if ( ! megamenus.length ) {
		return;
	}

	window.wpBlocks = window.wpBlocks || {};
	window.wpBlocks.megamenu = window.wpBlocks.megamenu || [];

	/**
	 * For each menu init the above functions
	 */
	for ( const menu of megamenus ) {
		// add a random id to identify the menu
		menu.id = generateRandomId( 'megamenu-' );

		// init the menu and add the menu to the global object
		window.wpBlocks.megamenu[ menu.id ] = new MegaMenu(
			menu as HTMLElement
		);
	}
} );
