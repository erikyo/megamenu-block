import {
	calcNewPosition,
	disableBodyScroll,
	getLowestWidth,
	removeStyles,
	setNewPosition,
} from '../utils';
import { TIMEOUT } from '../utils/constants';

export default class MegaMenu {
	private readonly megamenu: HTMLElement;
	private readonly interactiveItems: NodeListOf< HTMLElement >;
	private readonly originalState: boolean;
	private menuItems: NodeListOf< HTMLElement >;
	public hamburgerIconEl: HTMLElement;
	public breakpoint: number | undefined;
	private isResponsive: boolean;
	private activator: 'click' | 'hover' = 'hover';
	private currentLevel: number = 0;

	constructor( megamenu: HTMLElement ) {
		this.megamenu = megamenu;

		this.originalState = this.megamenu.classList.contains( 'is-mobile' );

		// The hamburger icon
		this.hamburgerIconEl = this.megamenu?.nextElementSibling as HTMLElement;

		// check if current device is under the menu breakpoint
		this.updateBreakpoint();
		this.isResponsive = this.isMobile() ?? false;

		// The megamenu has items, collect the menu items that need to be interactive.
		this.interactiveItems = this.getInteractiveItems();

		this.init();
	}

	/**
	 * The function initializes a megamenu by attaching events to menu items, updating the responsive menu,
	 * and updating the position of dropdowns based on the width of the parent menu.
	 */
	init() {
		// Update the position of the dropdowns based on the width of the parent menu.
		this.updateDropdownsPosition();

		// Add event listeners
		window.addEventListener( 'DOMContentLoaded', this.init.bind( this ) );

		window.addEventListener( 'resize', this.resize.bind( this ) );

		// Returns immediately whenever the megamenu has no inner nodes.
		if ( ! this.megamenu.childNodes.length ) {
			return;
		}
		// Attach the window/responsive related events to the megamenu
		this.updateResponsiveMenu();

		// Attach the events to the menu items.
		this.handleUserEvents();

		/**
		 * The function initializes a responsive menu by adding a click event listener to a hamburger icon
		 * element, which toggles the visibility of the mega menu element.
		 */
		this.hamburgerIconEl.onclick = () => this.showResponsiveToggle();

		// finally, add the "is-active" class to the megamenu container
		this.megamenu.classList.add( 'is-initialized' );
	}

	/**
	 * The function updates the activator based on the dataset attribute of the megamenu element.
	 *
	 * @param {string} activator The activator parameter is a string that represents the type of event that triggered
	 */
	updateActivator = ( activator?: 'click' | 'hover' ) => {
		if ( activator ) {
			this.activator = activator;
			return;
		}
		this.activator =
			this.megamenu.classList.contains( 'activator-click' ) ||
			this.megamenu.classList.contains( 'is-mobile' )
				? 'click'
				: 'hover';
	};

	/**
	 * The function updates the breakpoint based on the dataset attribute of the megamenu element.
	 */
	updateBreakpoint() {
		this.breakpoint = Number( this.megamenu.dataset.responsiveBreakpoint );
	}

	/**
	 * The function checks if the current viewport width is less than a specified breakpoint to determine
	 * if the device is a mobile device.
	 * @return A boolean value indicating whether the current viewport width is less than the specified
	 * breakpoint.
	 */
	isMobile(): boolean {
		return (
			this.breakpoint !== undefined &&
			this.breakpoint !== 0 &&
			document.body.clientWidth < this.breakpoint
		);
	}

	resize() {
		// update the flag that holds if the current device is under the menu breakpoint
		this.isResponsive = this.isMobile();

		// update the responsive menu and dropdowns
		this.updateResponsiveMenu();
		this.updateDropdownsPosition();
		this.menuItems = this.getInteractiveItems();
		this.updateActivator();

		// Attach the events to the menu items.
		this.handleUserEvents();
	}

	/**
	 * A function to set the menu level.
	 *
	 * @param {number} newLevel - The new level for the menu.
	 * @return {number} The new level for the menu.
	 */
	menuLevel( newLevel: number ): number {
		this.currentLevel = newLevel;
		this.megamenu.dataset.level = String( newLevel );
		return newLevel;
	}

	/**
	 * The function `showMenuToggleButton` checks the window width and adds or removes classes based on
	 * the responsive breakpoint to show or hide a menu toggle button.
	 */
	showMenuToggleButton() {
		if ( ! this.megamenu.classList.contains( 'is-collapsible' ) ) {
			return;
		}

		if ( this.hamburgerIconEl ) {
			if ( this.isResponsive ) {
				// show the menu toggle icon and set the megamnu in "mobile mode"
				this.hamburgerIconEl.classList.remove( 'is-hidden' );
				this.megamenu.classList.add( 'is-mobile' );
			} else {
				// hide the menu toggle icon and remove the mobile classes
				this.hamburgerIconEl.classList.add( 'is-hidden' );
				this.megamenu.classList.remove( 'is-mobile', 'is-opened' );
			}
		}
	}

	/**
	 * The function `updateResponsiveMenu` updates the responsive behavior of a mega menu based on the
	 * current device's screen size.
	 */
	updateResponsiveMenu() {
		// initialize the responsive menu toggle icon visibility.
		this.showMenuToggleButton();

		// reset the dropdown position for each item
		if ( this.isResponsive ) {
			if ( this.originalState !== this.isResponsive ) {
				this.showResponsiveToggle( false );

				Array.from( this.menuItems as NodeListOf< HTMLElement > )
					.map( ( menuItem ) =>
						menuItem.querySelector(
							'.wp-block-megamenu-item__dropdown'
						)
					)
					.forEach( ( dropdown ) =>
						removeStyles( dropdown as HTMLElement, [
							'left',
							'width',
							'maxWidth',
						] )
					);
			}
		}
	}

	/**
	 * The function handles user events for menu items, such as click, touch, mouse enter, and mouse leave,
	 * to open the corresponding menu item.
	 */
	handleUserEvents() {
		this.menuItems.forEach( ( menuItem ) => {
			let timeoutId: NodeJS.Timeout;

			/* Handle click / hover */
			if ( this.activator === 'click' ) {
				menuItem.onclick = ( ev: MouseEvent ) =>
					this.openMenuItem( ev );
				menuItem.onmouseenter = null;
			} else {
				menuItem.onmouseenter = ( ev ) => {
					clearTimeout( timeoutId );
					this.openMenuItem( ev );
				};
				menuItem.onclick = null;
			}

			/* Avoid focus out the menu on mobile devices */
			if ( this.isResponsive ) {
				return;
			}

			/* Handle mouse leave */
			menuItem.onmouseleave = ( ev: MouseEvent ) => {
				const target = ev.target as HTMLElement;
				// add the is-left class that will be checked in a while to handle menu re-focusing
				target.classList.add( 'is-left' );

				timeoutId = setTimeout( () => {
					if ( target.classList.contains( 'is-left' ) ) {
						this.openMenuItem( ev );
					}
				}, TIMEOUT );
			};
		} );
	}

	/**
	 * The function toggles the visibility of a responsive menu and changes the state of a hamburger icon.
	 * furthermore, it disables/enables the body scroll.
	 *
	 * @param force - A boolean value indicating whether to force the menu to be toggled or not.
	 */
	showResponsiveToggle( force: boolean | undefined = undefined ) {
		if ( this.currentLevel >= 2 ) {
			return this.closeLastChildren();
		} else if ( this.currentLevel < 2 ) {
			this.hamburgerIconEl.classList.remove( 'is-back' );
		}

		this.megamenu.classList.toggle( 'is-opened', force );

		this.hamburgerIconEl.classList.toggle( 'is-opened', force );

		disableBodyScroll( this.megamenu.classList.contains( 'is-opened' ) );
	}

	/**
	 * Closes the last children of the megamenu.
	 *
	 * @return {void} Does not return anything.
	 */
	closeLastChildren(): void {
		const openedItems = Array.from(
			this.megamenu.querySelectorAll( '.has-children.is-opened' )
		);

		if ( openedItems.length > 0 ) {
			// the menu item, in case of root menu item fallbacks to wp-block-megamenu-item
			this.menuLevel( this.currentLevel - 1 );

			// get the last opened menu item in tree and close it
			const lastOpenedItem = openedItems[ openedItems.length - 1 ];
			lastOpenedItem.classList.remove( 'is-opened' );
		}
	}

	/**
	 * The function `openMenuItem` is used to handle events such as click, mouseenter, and mouseleave to
	 * open and close menu items.
	 *
	 * @param {MouseEvent | TouchEvent} event - The event parameter is of type MouseEvent or TouchEvent. It
	 *                                        represents the event that triggered the function. It can be either a mouse event or a touch event.
	 */
	openMenuItem( event: MouseEvent | TouchEvent ) {
		// the event target could be the clicked item or the menu item
		const target = event.target as HTMLElement;

		if ( target.parentElement?.classList.contains( 'menu-item-link' ) ) {
			return;
		}

		event.preventDefault();
		event.stopImmediatePropagation();

		// the menu item, in case of root menu item fallbacks to wp-block-megamenu-item
		const menuItem: HTMLElement | null = target.classList.contains(
			'has-children'
		)
			? target
			: target.closest( '.has-children' );

		const toggleButton = document.querySelector(
			'.wp-block-megamenu__toggle-wrapper'
		) as HTMLButtonElement;

		if ( event.type === 'click' || event.type === 'mouseenter' ) {
			this.openMenuItemHelper( menuItem, toggleButton );
		} else if ( event.type === 'mouseleave' ) {
			this.closeMenuItemHelper( menuItem, toggleButton );
		}
	}

	/**
	 * Helper function to open a menu item.
	 *
	 * @param {HTMLElement|null}  menuItem     - The menu item to be opened.
	 * @param {HTMLButtonElement} toggleButton - The toggle button element.
	 */
	openMenuItemHelper(
		menuItem: HTMLElement | null,
		toggleButton: HTMLButtonElement
	) {
		this.menuLevel( this.currentLevel + 1 );

		const parentElements =
			menuItem?.parentElement?.querySelectorAll( '.is-opened' );
		if ( parentElements ) {
			parentElements.forEach( ( el ) => {
				el.classList.remove( 'is-opened' );
				el.classList.remove( 'is-left' );
			} );
		}

		menuItem?.classList.add( 'is-opened' );
		menuItem?.classList.remove( 'is-left' );
		toggleButton.classList.add( 'is-back' );
	}

	/**
	 * Helper function to close a menu item.
	 *
	 * @param {HTMLElement|null}  menuItem     - The menu item to be closed.
	 * @param {HTMLButtonElement} toggleButton - The toggle button element.
	 */
	closeMenuItemHelper(
		menuItem: HTMLElement | null,
		toggleButton: HTMLButtonElement
	) {
		this.menuLevel( 0 );
		menuItem?.classList.remove( 'is-opened' );
		toggleButton.classList.remove( 'is-back' );
	}

	/**
	 * The function sets the position and width of dropdown menus based on the width of the parent menu
	 * element.
	 */
	/**
	 * The function sets the position and width of dropdown menus based on the width of the parent menu
	 * element.
	 */
	updateDropdownsPosition() {
		if ( this.isResponsive ) {
			this.menuItems.forEach( ( menuItem ) => {
				const dropdown = menuItem.querySelector(
					'.wp-block-megamenu-item__dropdown'
				);
				if ( dropdown ) {
					( dropdown as HTMLElement ).style.cssText =
						'left: 0; max-width: unset;';
				}
			} );
			return;
		}

		const megamenu = this.megamenu;
		const megamenuRect = megamenu.getBoundingClientRect();
		const dropdownMaxWidth = Number( megamenu.dataset.dropdownWidth ) || 0;
		const bodySize = document.body.scrollWidth;

		for ( const menuItem of this.menuItems ) {
			const dropdown: HTMLElement | null = menuItem.querySelector(
				'.wp-block-megamenu-item__dropdown'
			);
			const hasFullWidthDropdown = this.megamenu.classList.contains(
				'has-full-width-dropdown'
			);

			if ( ! dropdown ) {
				continue;
			}

			const MegaMenuData = {
				blockBBox: menuItem.getBoundingClientRect(),
				dropdownBBox: dropdown?.getBoundingClientRect(),
				megamenuBBox: megamenuRect,
			};

			if ( hasFullWidthDropdown ) {
				dropdown.style.cssText = 'left: 0; right: 0;';
			}

			setNewPosition(
				dropdown,
				calcNewPosition(
					MegaMenuData,
					getLowestWidth( bodySize, dropdownMaxWidth ) || 0,
					hasFullWidthDropdown
				)
			);
		}
	}

	/**
	 * Retrieves the interactive items from the menu.
	 *
	 * @return {NodeList} - The list of interactive items.
	 */
	getInteractiveItems(): NodeListOf< HTMLElement > {
		const menuItems = this.megamenu.classList.contains( 'is-mobile' )
			? this.megamenu.querySelectorAll( '.has-children' )
			: this.menuItems;
		return (
			menuItems.length ? menuItems : []
		) as NodeListOf< HTMLElement >;
	}
}
