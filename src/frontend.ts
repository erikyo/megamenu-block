import './style.scss';
import {
	calcNewPosition,
	delay,
	disableBodyScroll,
	isMobile,
	setNewPosition,
} from './utils';
import { TIMEOUT } from './utils/constants';

/**
 * The function `openMenuItem` is used to handle events such as click, mouseenter, and mouseleave to
 * open and close menu items.
 *
 * @param {MouseEvent | TouchEvent} event - The event parameter is of type MouseEvent or TouchEvent. It
 *                                        represents the event that triggered the function. It can be either a mouse event or a touch event.
 */
function openMenuItem( event: MouseEvent | TouchEvent ) {
	event.preventDefault();
	// the event target could be the clicked item or the menu item
	const target =
		( event.currentTarget as HTMLElement ) ||
		( event.target as HTMLElement );
	// the menu item
	const menuItem = target.classList.contains( 'wp-block-megamenu-item' )
		? target
		: target.closest( '.wp-block-megamenu-item' );

	if ( ! menuItem ) return;

	const toggleButton = document.querySelector(
		'.wp-block-megamenu__toggle-wrapper'
	) as HTMLButtonElement;

	if ( event.type === 'click' || event.type === 'mouseenter' ) {
		// get all the parent elements that are opened and close them
		menuItem.parentElement
			?.querySelectorAll( '.is-opened' )
			.forEach( ( el ) => {
				el.classList.remove( 'is-opened' );
				el.classList.remove( 'is-left' );
			} );
		menuItem.classList.add( 'is-opened' );
		menuItem.classList.remove( 'is-left' );
		toggleButton.classList.add( 'is-back' );
	} else if ( event.type === 'mouseleave' ) {
		menuItem.classList.remove( 'is-opened' );
		toggleButton.classList.remove( 'is-back' );
	}
}

/**
 * The function toggles the visibility of a responsive menu and changes the state of a hamburger icon.
 * furthermore, it disables/enables the body scroll.
 *
 * @param megamenu        - The `megamenu` parameter is the element that represents the mega menu in your
 *                        HTML. It is the element that you want to toggle the "is-opened" class on to show or hide the menu.
 * @param hamburgerIconEl - The hamburgerIconEl parameter is the element that represents the hamburger
 *                        icon in your HTML. It is the element that you want to toggle the "is-opened" class on to show or
 *                        hide the menu.
 * @param force           - A boolean value indicating whether to force the menu to be toggled or not.
 */
function toggleResponsiveMenu(
	megamenu: HTMLElement,
	hamburgerIconEl: HTMLElement,
	force: boolean | undefined = undefined
) {
	megamenu.classList.toggle( 'is-opened', force );

	hamburgerIconEl.classList.toggle( 'is-opened', force );

	disableBodyScroll( megamenu.classList.contains( 'is-opened' ) );
}

/**
 * The function handles user events for menu items, such as click, touch, mouse enter, and mouse leave,
 * to open the corresponding menu item.
 *
 * @param menuItems - A NodeList of HTMLElements representing the menu items.
 * @param activator - The activator parameter is a string that represents the type of event that triggered
 */
function handleUserEvents(
	menuItems: NodeListOf< HTMLElement >,
	activator: 'hover' | 'click' = 'hover'
) {
	menuItems.forEach( ( menuItem ) => {
		let timeoutId: NodeJS.Timeout;

		if ( activator === 'click' ) {
			menuItem.onclick = ( ev: MouseEvent ) => openMenuItem( ev );
			menuItem.ontouchend = ( ev: TouchEvent ) => openMenuItem( ev );
			menuItem.onmouseenter = null;
		} else {
			menuItem.onmouseenter = ( ev ) => {
				clearTimeout( timeoutId );
				openMenuItem( ev );
			};
			menuItem.onclick = null;
			menuItem.ontouchend = null;
		}

		menuItem.onmouseleave = ( ev: MouseEvent ) => {
			const target = ev.target as HTMLElement;
			// add the is-left class that will be checked in a while to handle menu re-focusing
			target.classList.add( 'is-left' );

			timeoutId = setTimeout( () => {
				if ( target.classList.contains( 'is-left' ) ) {
					openMenuItem( ev );
				}
			}, TIMEOUT );
		};
	} );
}

/**
 * The function `updateResponsiveMenu` updates the responsive behavior of a mega menu based on the
 * current device's screen size.
 *
 * @param {HTMLElement}             megamenu  - The `megamenu` parameter is an HTMLElement representing the main
 *                                            menu element. It is the element that contains the menu items and is being updated to make it
 *                                            responsive.
 * @param {NodeListOf<HTMLElement>} menuItems - A NodeList of HTMLElements representing the menu items.
 */
function updateResponsiveMenu(
	megamenu: HTMLElement,
	menuItems: NodeListOf< HTMLElement >
) {
	// check if current device is under the menu breakpoint
	const breakpoint = Number( megamenu.dataset.responsiveBreakpoint );
	const isResponsive = isMobile( breakpoint );

	// the hamburger icon
	const hamburgerIconEl: HTMLElement | null =
		megamenu.nextElementSibling as HTMLElement;

	// initialize the responsive menu toggle icon visibility.
	showMenuToggleButton( megamenu, hamburgerIconEl, isResponsive );

	// reset the dropdown position for each item
	if ( isResponsive ) {
		toggleResponsiveMenu( megamenu, hamburgerIconEl, false );

		Array.from( menuItems )
			.map( ( menuItem ) =>
				menuItem.querySelector( '.wp-block-megamenu-item__dropdown' )
			)
			.forEach( ( dropdown ) => {
				setNewPosition( dropdown as HTMLElement, {
					left: '',
					width: '',
					maxWidth: '',
				} );
			} );
	}
}

/**
 * The function sets the position and width of dropdown menus based on the width of the parent menu
 * element.
 *
 * @param megamenu  - The megamenu element.
 * @param menuItems - A list of HTML elements representing the menu items.
 */
function updateDropdownsPosition(
	megamenu: HTMLElement,
	menuItems: NodeListOf< HTMLElement >
) {
	// check if current device is under the menu breakpoint
	const breakpoint = Number( megamenu.dataset.responsiveBreakpoint );
	const isResponsive = isMobile( breakpoint );
	if ( isResponsive ) return;

	const megamenuRect = megamenu.getBoundingClientRect();

	// the max width of the dropdown menu, 0 to fit the screen
	const dropdownMaxWidth = Number( megamenu.dataset.dropdownWidth ) || 0;

	menuItems.forEach( ( menuItem ) => {
		const dropdown: HTMLElement | null = menuItem.querySelector(
			'.wp-block-megamenu-item__dropdown'
		);

		if ( dropdown ) {
			// The fullwidth dropdown
			if ( megamenu.classList.contains( 'has-full-width-dropdown' ) ) {
				delay( 200 ).then( () => {
					dropdown.style.left = '0';
					setNewPosition(
						dropdown,
						calcNewPosition(
							{ width: document.body.clientWidth, x: 0 },
							dropdown.getBoundingClientRect(),
							document.body.clientWidth
						)
					);
				} );
			} else {
				// the custom width dropdown
				const dropdownRect = dropdown.getBoundingClientRect();
				setNewPosition(
					dropdown,
					calcNewPosition(
						megamenuRect,
						dropdownRect,
						dropdownMaxWidth
					)
				);
			}
		}
	} );
}

/**
 * The function `showMenuToggleButton` checks the window width and adds or removes classes based on
 * the responsive breakpoint to show or hide a menu toggle button.
 *
 * @param megamenu        - The megamenu that need to be toggled.
 * @param hamburgerIconEl
 * @param isResponsive    - Whether the menu is mobile or not.
 */
function showMenuToggleButton(
	megamenu: HTMLElement,
	hamburgerIconEl: HTMLElement,
	isResponsive: boolean
) {
	if ( ! megamenu.classList.contains( 'is-collapsible' ) ) {
		return;
	}

	if ( hamburgerIconEl ) {
		if ( isResponsive ) {
			// show the menu toggle icon and set the megamnu in "mobile mode"
			hamburgerIconEl.classList.remove( 'is-hidden' );
			megamenu.classList.add( 'is-mobile' );
		} else {
			// hide the menu toggle icon and remove the mobile classes
			hamburgerIconEl.classList.add( 'is-hidden' );
			megamenu.classList.remove( 'is-mobile', 'is-opened' );
		}
	}
}

/**
 * The function initializes a responsive menu by adding a click event listener to a hamburger icon
 * element, which toggles the visibility of the mega menu element.
 *
 * @param {HTMLElement} megamenu - The `megamenu` parameter is an HTML element that represents the main
 *                               menu container.
 */
function initResponsiveMenu( megamenu: HTMLElement ) {
	// the hamburger icon
	const hamburgerIconEl: HTMLElement | null =
		megamenu.nextElementSibling as HTMLElement;

	hamburgerIconEl.onclick = () =>
		toggleResponsiveMenu( megamenu, hamburgerIconEl );
	hamburgerIconEl.ontouchend = () =>
		toggleResponsiveMenu( megamenu, hamburgerIconEl );
}

/**
 * The function initializes a megamenu by attaching events to menu items, updating the responsive menu,
 * and updating the position of dropdowns based on the width of the parent menu.
 *
 * @param {HTMLElement} megamenu - The `megamenu` parameter is an HTML element that represents the
 *                               megamenu container. It is the element that contains all the menu items and dropdowns of the
 *                               megamenu.
 */
function initMegamenu( megamenu: HTMLElement ) {
	// Return immediately if the  megamenu has no content.
	if ( ! megamenu.childNodes.length ) return;

	// The megamenu has items, collect the menu items that need to be interactive.
	const menuItems: NodeListOf< HTMLElement > = megamenu.querySelectorAll(
		'.wp-block-megamenu-item.has-children'
	);

	// Attach the window/responsive related events to the megamenu
	updateResponsiveMenu( megamenu, menuItems );

	// Attach the events to the menu items.
	handleUserEvents(
		menuItems,
		megamenu.classList.contains( 'activator-click' ) ||
			megamenu.classList.contains( 'is-mobile' )
			? 'click'
			: 'hover'
	);

	// Initialize the responsive menu toggle menu visibility.
	initResponsiveMenu( megamenu );

	// Update the position of the dropdowns based on the width of the parent menu.
	updateDropdownsPosition( megamenu, menuItems );

	window.addEventListener( 'resize', () => {
		updateResponsiveMenu( megamenu, menuItems );
		updateDropdownsPosition( megamenu, menuItems );

		// Attach the events to the menu items.
		handleUserEvents(
			menuItems,
			megamenu.classList.contains( 'activator-click' ) ||
				megamenu.classList.contains( 'is-mobile' )
				? 'click'
				: 'hover'
		);
	} );
}

/* The code is adding an event listener to the `DOMContentLoaded` event, which is fired when the
initial HTML document has been completely loaded and parsed. When this event is triggered, the code
selects all elements with the class `wp-block-megamenu` using
`document.querySelectorAll('.wp-block-megamenu')`. It then iterates over each of these elements
using the `forEach` method and calls the `initMegamenu` function for each element. This function
initializes the mega menu by attaching event listeners and updating the menu's responsive behavior. */
document.addEventListener( 'DOMContentLoaded', () => {
	const megamenus = document.querySelectorAll(
		'.wp-block-megamenu'
	) as NodeListOf< HTMLElement >;

	/**
	 * For each menu init the above functions
	 */
	megamenus.forEach( ( megamenu ) => {
		initMegamenu( megamenu );
	} );
} );
