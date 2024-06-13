import { calcNewPosition, setNewPosition } from '../utils';

export class MenuItem {
	dropdown: HTMLElement | null;
	fullWidthDropdown: boolean;
	level: number;
	isOpened: boolean = false;
	hasChildren: any;
	button: HTMLElement;
	depth: number = 0;

	constructor(
		public el: HTMLElement,
		public args?: {
			fullWidthDropdown?: boolean;
			level?: number;
		}
	) {
		this.el = el;
		this.level = args?.level ?? 0;
		this.fullWidthDropdown = args?.fullWidthDropdown ?? false;
		this.button =
			this.el.querySelector( '.wp-block-megamenu-item' ) ||
			this.el.querySelector( 'a, button' ) ||
			el;
		this.dropdown = this.el.querySelector(
			'.wp-block-megamenu-item__dropdown'
		);
		this.hasChildren = this.el.classList.contains( 'has-children' );
	}

	/**
	 * Helper function to open a menu item.
	 */
	open() {
		this.isOpened = true;
		this.el?.classList.add( 'is-opened' );
		this.el?.classList.remove( 'is-left' );
	}

	/**
	 * Helper function to close a menu item.
	 */
	close() {
		if ( this.el && this.isOpened ) {
			this.isOpened = false;
			this.el.classList.remove( 'is-opened' );
		}
	}

	/**
	 * Updates the position of the dropdown menu item based on the maximum width allowed.
	 *
	 * @param          megamenuRect
	 * @param {number} [maxWidth=0] - The maximum width allowed for the dropdown. 0 means auto width
	 */
	updateDropdownPosition( megamenuRect: DOMRect, maxWidth: number = 0 ) {
		if ( this.dropdown ) {
			const items = {
				blockBBox: this.el.getBoundingClientRect(),
				dropdownBBox: this.dropdown?.getBoundingClientRect(),
				megamenuBBox: megamenuRect,
			};

			setNewPosition(
				this.dropdown,
				calcNewPosition( items, maxWidth, this.fullWidthDropdown )
			);
		}
	}
}
