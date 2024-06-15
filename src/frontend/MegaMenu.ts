import { detectTouchCapability, getLowestWidth, removeStyles } from '../utils';
import { IS_OPEN, EVENTS_ALLOWED, TIMEOUT } from '../utils/constants';
import { MenuItem } from './MenuItem';
import { Hamburger } from './Hamburger';

export default class MegaMenu {
	public el: HTMLElement;
	public hamburger: Hamburger;
	public menuItems: MenuItem[] = [];
	private readonly hasFullWidthDropdown: boolean;
	private readonly isCollapsible: boolean;
	private isResponsive: boolean = false;
	public breakpoint: number | undefined;
	private activator: EVENTS_ALLOWED = 'hover';
	currentLevel: number = 0;
	isOpened: boolean = false;
	openMenus: (MenuItem | MegaMenu)[] = [];

	/**
	 * Constructor function for MegaMenu class.
	 *
	 * @param {HTMLElement} megamenu - The HTML element representing the mega menu.
	 */
	constructor(megamenu: HTMLElement) {
		this.el = megamenu;

		/** eagerly detect support for mobile */
		this.isCollapsible = this.el.classList.contains('is-collapsible');

		this.hasFullWidthDropdown = this.el.classList.contains(
			'has-full-width-dropdown'
		);

		// Set the activator property based on the result
		this.activator = this.getActivator();

		/** The hamburger icon */
		this.hamburger = new Hamburger(
			this.el.nextElementSibling as HTMLElement
		);

		// Add event listeners
		window.addEventListener('DOMContentLoaded', this.init.bind(this));
		window.addEventListener('resize', this.reload.bind(this));
	}

	/**
	 * The function initializes a megamenu by attaching events to menu items, updating the responsive menu,
	 * and updating the position of dropdowns based on the width of the parent menu.
	 */
	init() {
		// Returns immediately whenever the megamenu has no inner nodes.
		if (!this.el.childNodes.length) {
			return;
		}

		// update the responsive menu items array
		this.updateMenuItems();

		// The megamenu has items, collect the menu items that need to be interactive.
		this.reload();

		this.hamburger.display(this.isResponsive);

		/**
		 * The function initializes a responsive menu by adding a click event listener to a hamburger icon
		 * element, which toggles the visibility of the mega menu element.
		 */
		this.hamburger.el.onclick = () => this.toggleHamburger();

		// finally, add the "is-initialized" class to the megamenu container
		this.el.classList.add('is-initialized');
	}

	/**
	 * Reloads the megamenu by updating the menu items, the activator, and the responsive menu.
	 */
	reload() {
		// update the flag that holds if the current device is under the menu breakpoint
		this.updateBreakpoint();

		// update the menu preferred activator
		this.setActivator();

		// close the currently open menu if the breakpoint changes
		this.closeAllOpened();

		// update the menu level
		this.updateLevel(0);

		// update the menu dropdown position and the hamburger icon
		this.updateControls();

		// Attach the events to the menu items.
		this.handleUserEvents();
	}

	/**
	 * Updates the menu items by collecting and adding level classes.
	 */
	updateMenuItems(): void {
		this.menuItems = this.collectMenuItems();
	}

	/**
	 * Toggles the visibility of the hamburger icon based on the current level.
	 */
	toggleHamburger() {
		if (this.currentLevel === 0) {
			this.open();
			this.updateLevel(1);
		} else {
			// extract the last item from the openMenus array
			this.closeLastOpenMenu(true);
		}
	}

	/**
	 * The function updates the activator based on the dataset attribute of the megamenu element.
	 *
	 * @param {string} activator The activator parameter is a string that represents the type of event that triggered
	 */
	setActivator = (activator?: EVENTS_ALLOWED): void => {
		if (activator) {
			this.activator = activator;
			return;
		}
		this.activator = this.getActivator();
	};

	/**
	 * The function returns the activator based on the dataset attribute of the megamenu element.
	 */
	getActivator(): EVENTS_ALLOWED {
		if (detectTouchCapability()) {
			return 'click';
		}
		if (this.el.dataset.activator === 'hover' && !this.isResponsive) {
			return 'hover';
		}
		return 'click';
	}

	/**
	 * The function updates the breakpoint based on the dataset attribute of the megamenu element.
	 */
	updateBreakpoint() {
		// store the current state
		const current = this.isResponsive;
		this.breakpoint = Number(this.el.dataset.responsiveBreakpoint);
		this.isResponsive = this.isMobile() ?? false;
		// if the state has changed reload the menu items and close all menus
		if (current !== this.isResponsive) {
			this.updateMenuItems();
			this.reload();
		}
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
	 * level cannot be lower than 0
	 *
	 * @param {number} newLevel - The new level for the menu.
	 */
	updateLevel(newLevel: number) {
		let level = Number(newLevel);
		if (level < 0) {
			level = 0;
		}
		this.currentLevel = level;
		this.hamburger.updateState(this.currentLevel);
		this.el.dataset.level = level.toString();
	}

	/**
	 * Checks if the given item is a MenuItem.
	 * @param item
	 */
	isMenuItem(item: any): item is MenuItem {
		return item instanceof MenuItem;
	}

	/**
	 * Checks if the given item is a MegaMenu.
	 * @param item
	 */
	isMegaMenu(item: any): item is MegaMenu {
		return item instanceof MegaMenu;
	}

	/**
	 * The function `showMenuToggleButton` checks the window width and adds or removes classes based on
	 * the responsive breakpoint to show or hide a menu toggle button.
	 */
	showMenuToggleButton() {
		if (!this.isCollapsible) {
			return;
		}

		if (this.hamburger.el) {
			if (this.isResponsive) {
				// show the menu toggle icon and set the megamnu in "mobile mode"
				this.hamburger.display();
				this.el.classList.add('is-mobile');
			} else {
				// hide the menu toggle icon and remove the mobile classes
				this.hamburger.display(false);
				this.el.classList.remove('is-mobile', IS_OPEN);
			}
		}
	}

	closeLastOpenMenu(force = false) {
		if (this.isResponsive && !force) {
			return;
		}
		// extract the last item from the openMenus array
		const lastOpenMenu = this.openMenus.pop();
		// if no open menu was found, try to close all the menus and reset the level
		if (!lastOpenMenu) {
			this.closeAllOpened();
			return;
		}
		// otherwise, close the menu and decrease the level number
		if (this.isMenuItem(lastOpenMenu)) {
			lastOpenMenu.close();
			this.updateLevel(this.currentLevel - 1);
		} else if (this.isMegaMenu(lastOpenMenu)) {
			this.close();
		}
	}

	/**
	 * Toggles the 'is-opened' class in the MegaMenu element based on the enable parameter.
	 * Designed to enable the megamenu in the responsive view (using the hamburger icon)
	 *
	 * @param {boolean} enable - Flag to enable/disable the 'is-opened' class
	 */
	private enableMegaMenu(enable: boolean = true) {
		if (!enable) {
			this.el.classList.remove(IS_OPEN);
			return;
		}
		this.el.classList.add(IS_OPEN);
	}

	/**
	 * Set the MegaMenu to be opened, enable body scroll, and enable the mega menu.
	 */
	open() {
		this.isOpened = true;
		this.hamburger.disableBodyScroll();
		this.enableMegaMenu();
	}

	/**
	 * Set the MegaMenu to be closed, update the level, and disable body scroll on hamburger close.
	 *
	 * @return {void} No return value
	 */
	close(): void {
		this.isOpened = false;
		this.enableMegaMenu(false);
		this.updateLevel(0);
		this.hamburger.enableBodyScroll();
	}

	/**
	 * The function handles user events for menu items, such as click, touch, mouse enter, and mouse leave,
	 * to open the corresponding menu item.
	 */
	handleUserEvents() {
		if (!this.menuItems) {
			return;
		}
		/** loop over all menu items and initialize the event listeners  */
		for (const menuItem of this.menuItems) {
			let timeoutId: NodeJS.Timeout;

			/**
			 * Handles the action to be taken on a mouse event.
			 *
			 * @param {MouseEvent} ev - The mouse event triggering the action.
			 */
			const action = (ev: MouseEvent) => {
				menuItem.el.classList.remove('is-left');
				if (!menuItem.isOpened) {
					ev.preventDefault();
					this.closeLastOpenMenu();
					clearTimeout(timeoutId);
					this.openMenuItem(menuItem);
				}
			};

			const leaveAction = () => {
				/* Avoid focus out the menu on mobile devices */
				if (!this.isResponsive && menuItem.isOpened) {
					// add the is-left class that will be checked in a while to handle menu re-focusing
					menuItem.el.classList.add('is-left');

					timeoutId = setTimeout(() => {
						if (menuItem.el.classList.contains('is-left')) {
							this.closeMenuItem(menuItem);
						}
					}, TIMEOUT);
				}
			};

			/* Handle hover */
			if (this.activator === 'hover') {
				menuItem.el.onmouseenter = action;
			} else {
				menuItem.el.onmouseenter = null;
			}

			/* Handle mouse leave */
			menuItem.el.onmouseleave = leaveAction;

			/* Handle click */
			menuItem.button.onclick = action;
		}
	}

	/**
	 * The function `openMenuItem` is used to handle events such as click, mouseenter, and mouseleave to
	 * open and close menu items.
	 *
	 * @param menuItem
	 */
	openMenuItem(menuItem: MenuItem) {
		if (!this.isResponsive) {
			menuItem.updateDropdownPosition(
				this.el.getBoundingClientRect(),
				this.el.ownerDocument.body.scrollWidth
			);
		}

		// open the dropdown
		menuItem.open();

		// add the item to the openMenus array
		this.openMenus.push(menuItem);

		// update the current level
		this.updateLevel(this.currentLevel + 1);

		// update the hamburger state in order to display the current level (available 0 to 2, 0 being the menu icon, 1 the close icon and > 2 the arrow back)
		this.hamburger.updateState(this.currentLevel);
	}

	/**
	 * The function `openMenuItem` is used to handle events such as click, mouseenter, and mouseleave to
	 * open and close menu items.
	 *
	 * @param menuItem - The MenuItem to be closed.
	 */
	closeMenuItem(menuItem: MenuItem) {
		if (this.currentLevel === 1) {
			menuItem.updateDropdownPosition(
				this.el.getBoundingClientRect(),
				this.el.ownerDocument.body.scrollWidth
			);
		}

		menuItem.close();

		this.updateLevel(this.currentLevel - 1);

		// update the hamburger state in order to display the current level (available 0 to 2, 0 being the menu icon, 1 the close icon and > 2 the arrow back)
		this.hamburger.updateState(this.currentLevel);
	}

	/**
	 * Closes all opened menu items by iterating through openMenus and calling close() on each opened menuItem.
	 * Then closes the MegaMenu itself.
	 *
	 * @return {void} No return value
	 */
	closeAllOpened() {
		this.openMenus.forEach((menuItem) => {
			if (menuItem.isOpened) {
				menuItem.close();
			}
		});
		this.close();
	}

	/**
	 * The function sets the position and width of dropdown menus based on the width of the parent menu
	 * element.
	 */
	updateControls() {
		// return if no menu items available
		if (!this.menuItems || !this.menuItems.length) {
			return;
		}

		// initialize the responsive menu toggle icon visibility.
		this.showMenuToggleButton();

		// reset the dropdown position for each item for the responsive menu
		if (this.isResponsive) {
			for (const menuItem of this.menuItems) {
				removeStyles(menuItem.dropdown, ['left', 'width', 'maxWidth']);
			}
		} else {
			const megamenu = this.el;
			const dropdownMaxWidth =
				Number(megamenu.dataset.dropdownWidth) || 0;
			const maxBodyWidth = getLowestWidth(
				document.body.scrollWidth,
				dropdownMaxWidth
			);
			const megamenuRect = this.el.getBoundingClientRect();

			for (const menuItem of this.menuItems) {
				menuItem.updateDropdownPosition(megamenuRect, maxBodyWidth);
			}
		}
	}

	/**
	 * Retrieves the interactive items from the menu.
	 *
	 * @return {NodeList} - The list of interactive items.
	 */
	collectMenuItems(): MenuItem[] {
		const menuItems = this.isResponsive
			? this.el.querySelectorAll('.has-children')
			: this.el.querySelectorAll('.wp-block-megamenu-item.has-children');
		return Array.from(menuItems).map((item) => {
			return new MenuItem(item as HTMLElement, {
				fullWidthDropdown: this.hasFullWidthDropdown,
				parent: this.el.closest('.has-children') as HTMLElement,
			});
		});
	}
}
