import './style.scss';
import { calcNewPosition, setDropdownStyle } from './utils';
import { TIMEOUT } from './utils/constants';

document.addEventListener( 'DOMContentLoaded', () => {
	const menus = document.querySelectorAll(
		'.wp-block-megamenu'
	) as NodeListOf< HTMLElement >;

	/**
	 * The function sets the position and width of dropdown menus based on the width of the parent menu
	 * element.
	 *
	 * @param menu - A list of HTML elements representing the menu items.
	 */
	function setDropdownsPosition( menu: HTMLElement ) {
		if ( menu.classList.contains( 'is-mobile' ) ) {
			const dropdown: HTMLElement | null = menu.querySelector(
				'.wp-block-megamenu-item__dropdown'
			);
			if ( dropdown )
				setDropdownStyle( dropdown, {
					left: '',
					width: '',
					maxWidth: '',
				} );
			return;
		}

		const megamenuItem: NodeListOf< HTMLElement > = menu.querySelectorAll(
			'.wp-block-megamenu-item.has-children'
		);

		megamenuItem.forEach( ( menuItem ) => {
			if ( menu.classList.contains( 'activator-click' ) ) {
				menuItem.addEventListener( 'click', ( e ) => {
					e.preventDefault();
					menuItem.classList.toggle( 'is-opened' );
				} );
			} else {
				let menuLeft = false;
				let timeoutId: NodeJS.Timeout;

				menuItem.addEventListener( 'mouseenter', () => {
					if ( ! menuLeft ) {
						//TODO: check before if there are any dropdowns open
						menuItem.classList.add( 'is-opened' );
					}
					clearTimeout( timeoutId );
					menuLeft = false;
				} );

				menuItem.addEventListener( 'mouseleave', () => {
					timeoutId = setTimeout( () => {
						if ( menuLeft ) {
							menuItem.classList.remove( 'is-opened' );
							menuLeft = false;
						}
					}, TIMEOUT );

					menuLeft = true;
				} );
			}
		} );

		const menuItems: NodeListOf< HTMLElement > = menu.querySelectorAll(
			'.wp-block-megamenu-item'
		);

		const megamenuRect = menu.getBoundingClientRect();

		// the max width of the dropdown menu
		const dropdownMaxWidth = Number( menu.dataset.dropdownWidth ) || 0;

		menuItems.forEach( ( menuItem ) => {
			const dropdown: HTMLElement | null = menuItem.querySelector(
				'.wp-block-megamenu-item__dropdown'
			);

			if ( dropdown ) {
				let newDropdownPosition: Partial< {
					width: number;
					left: number;
					maxWidth: number;
				} > = {};

				if ( menu.classList.contains( 'has-full-width-dropdown' ) ) {
					setDropdownStyle( dropdown, {
						...calcNewPosition(
							{ width: document.body.clientWidth, x: 0 },
							dropdown.getBoundingClientRect(),
							dropdownMaxWidth
						),
						maxWidth: document.body.clientWidth,
					} );
				} else {
					const dropdownRect = dropdown.getBoundingClientRect();
					newDropdownPosition = calcNewPosition(
						megamenuRect,
						dropdownRect,
						dropdownMaxWidth
					);
					setDropdownStyle( dropdown, {
						width: newDropdownPosition.width,
						left: newDropdownPosition.left,
						maxWidth: dropdownMaxWidth,
					} );
				}
			}
		} );
	}

	/**
	 * The function `showMenuToggleButton` checks the window width and adds or removes classes based on
	 * the responsive breakpoint to show or hide a menu toggle button.
	 *
	 * @param menu - The menu elements that need to be toggled.
	 */
	function showMenuToggleButton( menu: HTMLElement ) {
		if ( ! menu.classList.contains( 'is-collapsible' ) ) {
			return;
		}
		const breakpoint = Number( menu.dataset.responsiveBreakpoint );
		const toggleButtonWrapper: HTMLElement | null =
			menu.nextElementSibling as HTMLElement;

		if ( toggleButtonWrapper ) {
			if ( breakpoint >= document.body.clientWidth ) {
				toggleButtonWrapper.classList.remove( 'is-hidden' );
				menu.classList.add( 'is-mobile' );
			} else {
				toggleButtonWrapper.classList.add( 'is-hidden' );
				menu.classList.remove( 'is-mobile', 'is-opened' );
			}
		}
	}

	/**
	 * The function attaches toggle actions to buttons in a mobile menu.
	 *
	 * @param menu - The HTML element representing a collection of menu elements.
	 */
	function attachToggleActionToButtons( menu: HTMLElement ): void {
		/**
		 * the responsive toggle button element
		 */
		menu.nextElementSibling?.addEventListener( 'click', ( event ) => {
			const target = event.target as HTMLElement;
			if ( target.classList.contains( 'wp-block-megamenu__toggle' ) ) {
				toggleMobileMenu( target, menu );
			}
		} );
		/**
		 * the dropdown element click handler
		 */
		menu.addEventListener( 'click', ( event ) => {
			const target = event.target as HTMLElement;
			if ( target ) {
				if ( target.classList.contains( 'has-children' ) ) {
					const dropdown: HTMLElement | null | undefined = target
						.closest( '.wp-block-megamenu-item' )
						?.querySelector( '.wp-block-megamenu-item__dropdown' );
					if ( dropdown ) toggleMobileMenu( target, dropdown );
				}
			}
		} );
	}

	/**
	 * The function toggles the "is-opened" class on both the toggleButton and menu elements.
	 *
	 * @param {HTMLElement} toggleButton - The toggleButton parameter is an HTMLElement that represents
	 *                                   the button element used to toggle the mobile menu.
	 * @param {HTMLElement} menu         - The `menu` parameter is an HTMLElement representing the mobile menu
	 *                                   element.
	 */
	function toggleMobileMenu( toggleButton: HTMLElement, menu: HTMLElement ) {
		toggleButton.classList.toggle( 'is-opened' );
		menu.classList.toggle( 'is-opened' );
	}

	/**
	 * The function sets the position and width of the mobile menu dropdown based on the position of the
	 * menu element.
	 *
	 * @param menu - The menu element.
	 */
	function setMobileMenuPosition( menu: HTMLElement ) {
		const dropdown: HTMLElement | null = menu.querySelector(
			'.wp-block-megamenu__content'
		);

		if ( ! dropdown ) return;

		if ( ! menu.classList.contains( 'is-mobile' ) ) {
			dropdown.style.left = '';
			dropdown.style.width = '';
			return false;
		}

		const menuCoords = menu.getBoundingClientRect();
		const left = -menuCoords.left;

		dropdown.style.left = `${ left }px`;
		dropdown.style.width = `${ document.body.clientWidth }px`;
	}

	/**
	 * For each menu init the above functions
	 */
	menus.forEach( ( menu ) => {
		showMenuToggleButton( menu );
		attachToggleActionToButtons( menu );
		setDropdownsPosition( menu );
		setMobileMenuPosition( menu );

		window.addEventListener( 'resize', () => {
			showMenuToggleButton( menu );
			setDropdownsPosition( menu );
			setMobileMenuPosition( menu );
		} );
	} );
} );
