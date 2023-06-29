const TIMEOUT: number = 500;

document.addEventListener( 'DOMContentLoaded', () => {
	const menus = document.querySelectorAll(
		'.gw-mm'
	) as NodeListOf< HTMLElement >;
	const plainMenus = document.querySelectorAll(
		'.gw-pm'
	) as NodeListOf< HTMLElement >;

	/**
	 * The function sets the position and width of dropdown menus based on the width of the parent menu
	 * element.
	 *
	 * @param menuElements - A list of HTML elements representing the menu items.
	 */
	function setDropdownsPosition( menuElements: NodeListOf< HTMLElement > ) {
		menuElements.forEach( ( menu ) => {
			if ( menu.classList.contains( 'is-mobile' ) ) {
				const dropdownWrapper: HTMLElement | null = menu.querySelector(
					'.gw-mm-item__dropdown-wrapper'
				);
				if (dropdownWrapper) {
					dropdownWrapper.style.left = '';
					dropdownWrapper.style.width = '';
					dropdownWrapper.style.maxWidth = '';
				}
				return;
			}

			const megamenuItem: NodeListOf< HTMLElement > = menu.querySelectorAll(
				'.wp-block-getwid-megamenu-item.has-children'
			);

			megamenuItem.forEach((menuItem) => {

				if (menu.classList.contains('activator-click')) {
					menuItem.addEventListener('click', (e) => {
						e.preventDefault();
						menuItem.classList.toggle('is-opened');
					});
				} else {
					let menuLeft = false;
					let timeoutId: NodeJS.Timeout;

					menuItem.addEventListener('mouseenter', () => {
						if (!menuLeft) {
							menuItem.classList.add('is-opened');
						}
						clearTimeout(timeoutId);
						menuLeft = false;
					});

					menuItem.addEventListener('mouseleave', () => {

						timeoutId = setTimeout(() => {
							if (menuLeft) {
								menuItem.classList.remove('is-opened');
								menuLeft = false;
							}
						}, TIMEOUT);

						menuLeft = true;
					});
				}

			})

			const dropdowns: NodeListOf< HTMLElement > = menu.querySelectorAll(
				'.gw-mm-item__dropdown-wrapper'
			);
			const menuCoords = menu.getBoundingClientRect();
			const maxWidth = Number( menu.dataset.dropdownWidth );
			const width = menu.classList.contains( 'has-full-width-dropdown' )
				? window.innerWidth
				: menu.offsetWidth;
			let left = menu.classList.contains( 'has-full-width-dropdown' )
				? -menuCoords.left
				: 0;

			if ( maxWidth && maxWidth < width ) {
				left = left + ( width - maxWidth ) / 2;
			}

			dropdowns.forEach( ( dropdown ) => {
				dropdown.style.left = `${ left }px`;
				dropdown.style.width = `${ width }px`;
				dropdown.style.maxWidth = `${ maxWidth }px`;
			} );
		} );
	}

	/**
	 * The function sets the maximum width of dropdown content elements in a menu based on a specified
	 * data attribute.
	 *
	 * @param menuElements - A list of HTML elements that represent the dropdown menus.
	 */
	function setDropdownsContentWidth(
		menuElements: NodeListOf< HTMLElement >
	) {
		menuElements.forEach( ( menu ) => {
			const contentWidth = menu.dataset.dropdownContentWidth;
			if ( contentWidth ) {
				const dropdownContent: HTMLElement | null = menu.querySelector(
					'.gw-mm-item__dropdown-content'
				);
				if ( dropdownContent )
					dropdownContent.style.maxWidth = contentWidth;
			}
		} );
	}

	/**
	 * The function `showMenuToggleButton` checks the window width and adds or removes classes based on
	 * the responsive breakpoint to show or hide a menu toggle button.
	 *
	 * @param menuElements - A NodeList of HTMLElements representing the menu elements that need to be
	 *                     toggled.
	 */
	function showMenuToggleButton( menuElements: NodeListOf< HTMLElement > ) {
		menuElements.forEach( ( menu ) => {
			if ( ! menu.classList.contains( 'is-collapsible' ) ) {
				return;
			}
			const breakpoint = Number( menu.dataset.responsiveBreakpoint );
			const toggleButtonWrapper: HTMLElement | null = menu.querySelector(
				'.gw-mm__toggle-wrapper'
			);

			if ( toggleButtonWrapper ) {
				if ( breakpoint >= window.innerWidth ) {
					toggleButtonWrapper.classList.remove( 'is-hidden' );
					menu.classList.add( 'is-mobile' );
				} else {
					toggleButtonWrapper.classList.add( 'is-hidden' );
					menu.classList.remove( 'is-mobile', 'is-opened' );
				}
			}
		} );
	}

	/**
	 * The function attaches toggle actions to buttons in a mobile menu.
	 *
	 * @param menuElements - A NodeListOf<HTMLElement> representing a collection of menu elements.
	 */
	function attachToggleActionToButtons(
		menuElements: NodeListOf< HTMLElement >
	): void {
		menuElements.forEach( ( menu ) => {
			menu.addEventListener( 'click', ( event ) => {
				const target = event.target as HTMLElement;
				if ( target ) {
					if ( target.classList.contains( 'gw-mm__toggle' ) ) {
						toggleMobileMenu( target, menu );
					}

					if ( target.classList.contains( 'gw-mm-item__toggle' ) ) {
						const dropdown: HTMLElement | null | undefined = target
							.closest( '.gw-mm-item' )
							?.querySelector( '.gw-mm-item__dropdown-swrapper' );
						if ( dropdown ) toggleMobileMenu( target, dropdown );
					}
				}
			} );
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
	 * @param menuElements - An array of menu elements.
	 */
	function setMobileMenuPosition( menuElements: NodeListOf< HTMLElement > ) {
		menuElements.forEach( ( menu ) => {
			const dropdown: HTMLElement | null = menu.querySelector(
				'.gw-mm__content-wrapper'
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
			dropdown.style.width = `${ window.innerWidth }px`;
		} );
	}

	/**
	 * The function sets the position of dropdown menus based on their alignment with the right edge of
	 * the root element.
	 *
	 * @param menuElements - A NodeList of HTMLElements representing the menu elements.
	 */
	function setPlainMenusDropdownPosition(
		menuElements: NodeListOf< HTMLElement >
	) {
		menuElements.forEach( ( menu ) => {
			if ( ! menu ) return;
			const dropdowns: NodeListOf< HTMLElement > | null =
				menu.querySelectorAll( '.gw-pm-item__dropdown' );
			const isInsideMegaMenu = menu.closest( '.gw-mm' );

			dropdowns.forEach( ( dropdown ) => {
				dropdown.classList.remove( 'toleft' );

				const rightEdgePosition =
					dropdown.getBoundingClientRect().left +
					dropdown.offsetWidth;
				let rootWidth: number;
				const wrapper = menu.closest( '.gw-mm-item__dropdown-wrapper' );
				if ( wrapper && isInsideMegaMenu ) {
					rootWidth =
						wrapper.getBoundingClientRect().left +
						(
							menu.closest(
								'.gw-mm-item__dropdown-wrapper'
							) as HTMLElement
						 ).offsetWidth;
				} else {
					rootWidth = window.innerWidth;
				}
				let isLeft = false;

				if ( rightEdgePosition >= rootWidth ) {
					isLeft = true;
				}

				if ( isLeft ) {
					dropdown.classList.add( 'toleft' );
				}
			} );
		} );
	}

	showMenuToggleButton( menus );
	attachToggleActionToButtons( menus );
	setDropdownsPosition( menus );
	setDropdownsContentWidth( menus );
	setMobileMenuPosition( menus );
	setPlainMenusDropdownPosition( plainMenus );

	window.addEventListener( 'resize', () => {
		showMenuToggleButton( menus );
		setDropdownsPosition( menus );
		setMobileMenuPosition( menus );
		setPlainMenusDropdownPosition( plainMenus );
	} );
} );
