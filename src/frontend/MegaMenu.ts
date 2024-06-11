import { getLowestWidth, removeStyles } from '../utils';
import { TIMEOUT } from '../utils/constants';
import { MenuItem } from './MenuItem';
import { Hamburger } from './Hamburger';

export default class MegaMenu {
	public megamenu: HTMLElement;
	private menuItems: MenuItem[] = [];
	public hamburger: Hamburger;
	private readonly originalState: boolean;
	private readonly hasFullWidthDropdown: boolean;
	private readonly isCollapsible: boolean;
	private isResponsive: boolean = false;
	public breakpoint: number | undefined;
	private activator: 'click' | 'hover' = 'hover';
	private currentLevel: number = 0;

	constructor( megamenu: HTMLElement ) {
		this.megamenu = megamenu;

		/** eagerly detect support for mobile */
		this.originalState = this.megamenu.classList.contains( 'is-mobile' );
		this.isCollapsible =
			this.megamenu.classList.contains( 'is-collapsible' );

		this.hasFullWidthDropdown = this.megamenu.classList.contains(
			'has-full-width-dropdown'
		);
		this.activator = this.getActivator();

		/** The hamburger icon */
		this.hamburger = new Hamburger( this.megamenu );

		// check if current device is under the menu breakpoint
		this.updateBreakpoint();

		this.hamburger.display( this.isResponsive );

		// Add event listeners
		window.addEventListener( 'DOMContentLoaded', this.init.bind( this ) );
		window.addEventListener( 'resize', this.reload.bind( this ) );
	}

	/**
	 * The function initializes a megamenu by attaching events to menu items, updating the responsive menu,
	 * and updating the position of dropdowns based on the width of the parent menu.
	 */
	init() {
		// Returns immediately whenever the megamenu has no inner nodes.
		if ( ! this.megamenu.childNodes.length ) {
			return;
		}

		// update the responsive menu items array
		this.menuItems = this.collectMenuItems();

		// The megamenu has items, collect the menu items that need to be interactive.
		this.reload();

		/**
		 * The function initializes a responsive menu by adding a click event listener to a hamburger icon
		 * element, which toggles the visibility of the mega menu element.
		 */
		this.hamburger.el.onclick = () => {
			if ( this.currentLevel === 0 ) {
				this.hamburger.enableBodyScroll();
				this.enableResponsiveMenu();
			}
			this.hamburger.disableBodyScroll();
			this.hamburger.updateState( this.currentLevel );
		};

		// finally, add the "is-initialized" class to the megamenu container
		this.megamenu.classList.add( 'is-initialized' );
	}

	reload() {
		// update the flag that holds if the current device is under the menu breakpoint
		this.isResponsive = this.isMobile();

		this.setActivator();
		this.updateDropdownsPosition();
		this.updateResponsiveMenu();

		// Attach the events to the menu items.
		this.handleUserEvents();
	}

	/**
	 * The function updates the activator based on the dataset attribute of the megamenu element.
	 *
	 * @param {string} activator The activator parameter is a string that represents the type of event that triggered
	 */
	setActivator = ( activator?: 'click' | 'hover' ) => {
		if ( activator ) {
			this.activator = activator;
			return;
		}
		this.activator =
			this.getActivator() === 'click' || this.isResponsive
				? 'click'
				: 'hover';
	};

	getActivator(): 'click' | 'hover' {
		if ( this.megamenu.dataset.activator === 'hover' ) {
			return 'hover';
		}
		return 'click';
	}

	/**
	 * The function updates the breakpoint based on the dataset attribute of the megamenu element.
	 */
	updateBreakpoint() {
		this.breakpoint = Number( this.megamenu.dataset.responsiveBreakpoint );
		this.isResponsive = this.isMobile() ?? false;
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

	/**
	 * A function to set the menu level.
	 *
	 * @param {number} newLevel - The new level for the menu.
	 * @return {number} The new level for the menu.
	 */
	updateLevel( newLevel: number ): number {
		this.currentLevel = newLevel;
		this.megamenu.dataset.level = newLevel.toString();
		return newLevel;
	}

	/**
	 * The function `showMenuToggleButton` checks the window width and adds or removes classes based on
	 * the responsive breakpoint to show or hide a menu toggle button.
	 */
	showMenuToggleButton() {
		if ( ! this.isCollapsible ) {
			return;
		}

		if ( this.hamburger ) {
			if ( this.isResponsive ) {
				// show the menu toggle icon and set the megamnu in "mobile mode"
				this.hamburger.display();
				this.megamenu.classList.add( 'is-mobile' );
			} else {
				// hide the menu toggle icon and remove the mobile classes
				this.hamburger.display( false );
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

		// reset the dropdown position for each item for the responsive menu
		if ( this.isResponsive && this.menuItems.length ) {
			if ( this.originalState !== this.isResponsive ) {
				this.hamburger.display();

				for ( const menuItem of this.menuItems ) {
					removeStyles( menuItem.dropdown, [
						'left',
						'width',
						'maxWidth',
					] );
				}
			}
		}
	}

	/**
	 * The function handles user events for menu items, such as click, touch, mouse enter, and mouse leave,
	 * to open the corresponding menu item.
	 */
	handleUserEvents() {
		if ( ! this.menuItems ) {
			return;
		}
		/** loop over all menu items and initialize the event listeners  */
		for ( const menuItem of this.menuItems ) {
			let timeoutId: NodeJS.Timeout;

			/* Handle click / hover */
			if ( this.activator === 'click' || this.isResponsive ) {
				menuItem.el.onmouseenter = null;
				menuItem.el.onclick = ( ev: MouseEvent ) => {
					ev.preventDefault();
					ev.stopImmediatePropagation();
					this.openMenuItem( menuItem, 'click' );
				};
			} else {
				menuItem.el.onclick = null;
				menuItem.el.onmouseenter = ( ev: MouseEvent ) => {
					clearTimeout( timeoutId );
					ev.preventDefault();
					ev.stopImmediatePropagation();
					this.openMenuItem( menuItem, 'mouseenter' );
				};
			}

			/* Avoid focus out the menu on mobile devices */
			if ( this.isResponsive ) {
				return;
			}

			/* Handle mouse leave */
			menuItem.el.onmouseleave = ( ev: MouseEvent ) => {
				// add the is-left class that will be checked in a while to handle menu re-focusing
				menuItem.el.classList.add( 'is-left' );

				timeoutId = setTimeout( () => {
					if ( menuItem.el.classList.contains( 'is-left' ) ) {
						this.openMenuItem( menuItem, 'mouseleave' );
					}
				}, TIMEOUT );
			};
		}
	}

	/**
	 * Closes the last children of the megamenu.
	 *
	 * @return {void} Does not return anything.
	 */
	closeDropdowns(): void {
		for ( const menuItem of this.menuItems ) {
			menuItem.close();
		}
	}

	private enableResponsiveMenu( enable: boolean = true ) {
		if ( ! enable ) {
			this.megamenu.classList.remove( 'is-opened' );
			return;
		}
		this.megamenu.classList.add( 'is-opened' );
	}

	/**
	 * The function `openMenuItem` is used to handle events such as click, mouseenter, and mouseleave to
	 * open and close menu items.
	 *
	 * @param {MouseEvent | TouchEvent} event    - The event parameter is of type MouseEvent or TouchEvent. It
	 *                                           represents the event that triggered the function. It can be either a mouse event or a touch event.
	 * @param                           target
	 * @param                           ev
	 * @param                           menuItem
	 * @param                           action
	 */
	openMenuItem( menuItem: MenuItem, action: string = 'open' ) {
		menuItem.updateDropdownPosition(
			this.megamenu.getBoundingClientRect(),
			this.megamenu.ownerDocument.body.scrollWidth
		);

		if ( action === 'click' || action === 'mouseenter' ) {
			this.updateLevel( this.currentLevel + 1 );
			menuItem.open();
			this.hamburger.status( 'back' );
		} else if ( action === 'mouseleave' ) {
			this.currentLevel = 0;
			menuItem.close();
			this.hamburger.status( 'back' );
		}
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
		// return if no menu items available
		if ( ! this.menuItems ) {
			return;
		}

		if ( this.isResponsive ) {
			return;
		}

		const megamenu = this.megamenu;
		const dropdownMaxWidth = Number( megamenu.dataset.dropdownWidth ) || 0;
		const maxBodyWidth = getLowestWidth(
			document.body.scrollWidth,
			dropdownMaxWidth
		);
		const megamenuRect = this.megamenu.getBoundingClientRect();

		for ( const menuItem of this.menuItems ) {
			menuItem.updateDropdownPosition( megamenuRect, maxBodyWidth );
		}
	}

	/**
	 * Retrieves the interactive items from the menu.
	 *
	 * @return {NodeList} - The list of interactive items.
	 */
	collectMenuItems(): MenuItem[] {
		const menuItems = this.isResponsive
			? this.megamenu.querySelectorAll( '.has-children' )
			: this.megamenu.querySelectorAll(
					'.wp-block-megamenu-item.has-children'
			  );
		return Array.from( menuItems ).map( ( item ) => {
			return new MenuItem( item as HTMLElement, {
				fullWidthDropdown: this.hasFullWidthDropdown,
			} );
		} );
	}
}
