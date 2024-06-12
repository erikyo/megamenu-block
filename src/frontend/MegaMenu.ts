import { addLevelClass, getLowestWidth, removeStyles } from '../utils';
import { TIMEOUT } from '../utils/constants';
import { MenuItem } from './MenuItem';
import { Hamburger } from './Hamburger';

type ItemsAllowedEvents = 'click' | 'hover';

export default class MegaMenu {
	public el: HTMLElement;
	private menuItems: MenuItem[] = [];
	public hamburger: Hamburger;
	private readonly originalState: boolean;
	private readonly hasFullWidthDropdown: boolean;
	private readonly isCollapsible: boolean;
	private isResponsive: boolean = false;
	public breakpoint: number | undefined;
	private activator: 'click' | 'hover' = 'hover';
	currentLevel: number = 0;
	openMenus: MenuItem[] | MegaMenu[] = [];

	constructor( megamenu: HTMLElement ) {
		this.el = megamenu;

		/** eagerly detect support for mobile */
		this.originalState = this.el.classList.contains( 'is-mobile' );
		this.isCollapsible = this.el.classList.contains( 'is-collapsible' );

		this.hasFullWidthDropdown = this.el.classList.contains(
			'has-full-width-dropdown'
		);
		this.activator = this.getActivator();

		/** The hamburger icon */
		this.hamburger = new Hamburger(
			this.el.nextElementSibling as HTMLElement
		);

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
		if ( ! this.el.childNodes.length ) {
			return;
		}

		// update the responsive menu items array
		this.updateMenuItems();

		// The megamenu has items, collect the menu items that need to be interactive.
		this.reload();

		/**
		 * The function initializes a responsive menu by adding a click event listener to a hamburger icon
		 * element, which toggles the visibility of the mega menu element.
		 */
		this.hamburger.el.onclick = () => this.handleResponsiveMenu();

		// finally, add the "is-initialized" class to the megamenu container
		this.el.classList.add( 'is-initialized' );
	}

	updateMenuItems() {
		this.menuItems = this.collectMenuItems();

		addLevelClass( this.menuItems );
	}

	handleResponsiveMenu() {
		if ( this.currentLevel === 0 ) {
			this.currentLevel++;
			this.enableMegaMenu( true );
			this.hamburger.enableBodyScroll();
		} else {
			// extract the last item from the openMenus array
			this.closeLastOpenMenu();
		}
		this.hamburger.updateState( this.currentLevel );
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
	setActivator = ( activator?: ItemsAllowedEvents ) => {
		if ( activator ) {
			this.activator = activator;
			return;
		}
		this.activator = this.getActivator();
	};

	getActivator(): ItemsAllowedEvents {
		if ( this.el.dataset.activator === 'hover' && ! this.isResponsive ) {
			return 'hover';
		}
		return 'click';
	}

	/**
	 * The function updates the breakpoint based on the dataset attribute of the megamenu element.
	 */
	updateBreakpoint() {
		this.breakpoint = Number( this.el.dataset.responsiveBreakpoint );
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
	 */
	updateLevel( newLevel: number ) {
		console.log( newLevel );
		this.currentLevel = newLevel;
		this.hamburger.updateState( this.currentLevel );
		this.el.dataset.level = newLevel.toString();
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
				this.el.classList.add( 'is-mobile' );
			} else {
				// hide the menu toggle icon and remove the mobile classes
				this.hamburger.display( false );
				this.el.classList.remove( 'is-mobile', 'is-opened' );
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
			for ( const menuItem of this.menuItems ) {
				removeStyles( menuItem.dropdown, [
					'left',
					'width',
					'maxWidth',
				] );
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

			/* Handle hover */
			if ( this.activator === 'hover' ) {
				menuItem.el.onmouseenter = ( ev: MouseEvent ) => {
					if ( this.currentLevel === 0 ) {
						this.closeLastOpenMenu();
					}
					if ( menuItem.hasChildren ) {
						clearTimeout( timeoutId );
						ev.preventDefault();
						ev.stopImmediatePropagation();
						this.openMenuItem( menuItem, 'mouseenter' );
					}
				};
			}

			/* Handle click */
			menuItem.button.onclick = ( ev: MouseEvent ) => {
				if ( this.currentLevel === 0 ) {
					this.closeLastOpenMenu();
				}
				if ( menuItem.hasChildren ) {
					ev.preventDefault();
					ev.stopImmediatePropagation();
					this.openMenuItem( menuItem, 'click' );
				}
			};

			/* Handle mouse leave */
			menuItem.el.onmouseleave = () => {
				/* Avoid focus out the menu on mobile devices */
				if ( ! this.isResponsive ) {
					// add the is-left class that will be checked in a while to handle menu re-focusing
					menuItem.el.classList.add( 'is-left' );

					timeoutId = setTimeout( () => {
						if ( menuItem.el.classList.contains( 'is-left' ) ) {
							this.openMenuItem( menuItem, 'mouseleave' );
						}
					}, TIMEOUT );
				}
			};
		}
	}

	closeLastOpenMenu() {
		// extract the last item from the openMenus array
		const lastOpenMenu = this.openMenus.pop();
		console.log( lastOpenMenu );
		if ( ! lastOpenMenu ) {
			this.enableMegaMenu( false );
			this.updateLevel( 0 );
			this.hamburger.updateState( 0 );
		} else {
			lastOpenMenu.close();
			this.updateLevel( this.currentLevel - 1 );
			this.hamburger.updateState( this.currentLevel );
		}
	}

	private enableMegaMenu( enable: boolean = true ) {
		if ( ! enable ) {
			this.el.classList.remove( 'is-opened' );
			return;
		}
		this.el.classList.add( 'is-opened' );
	}

	/**
	 * The function `openMenuItem` is used to handle events such as click, mouseenter, and mouseleave to
	 * open and close menu items.
	 *
	 * @param menuItem
	 * @param action
	 */
	openMenuItem( menuItem: MenuItem, action: string ) {
		if ( this.currentLevel === 0 ) {
			menuItem.updateDropdownPosition(
				this.el.getBoundingClientRect(),
				this.el.ownerDocument.body.scrollWidth
			);
		}

		if ( action === 'click' || action === 'mouseenter' ) {
			// add the item to the openMenus array
			this.openMenus.push( menuItem );
			// open the dropdown
			menuItem.open();
			// update the current level
			this.updateLevel( this.currentLevel + 1 );
		} else if ( action === 'mouseleave' ) {
			this.openMenus = this.openMenus.filter(
				( openMenu ) => openMenu !== menuItem
			);
			menuItem.close();
			this.updateLevel( this.currentLevel - 1 );
		}
		// update the hamburger state in order to display the current level (available 0 to 2, 0 being the menu icon, 1 the close icon and > 2 the arrow back)
		this.hamburger.updateState( this.currentLevel );
	}

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

		const megamenu = this.el;
		const dropdownMaxWidth = Number( megamenu.dataset.dropdownWidth ) || 0;
		const maxBodyWidth = getLowestWidth(
			document.body.scrollWidth,
			dropdownMaxWidth
		);
		const megamenuRect = this.el.getBoundingClientRect();

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
			? this.el.querySelectorAll( '.has-children' )
			: this.el.querySelectorAll(
					'.wp-block-megamenu-item.has-children'
			  );
		return Array.from( menuItems ).map( ( item ) => {
			return new MenuItem( item as HTMLElement, {
				fullWidthDropdown: this.hasFullWidthDropdown,
			} );
		} );
	}
}
