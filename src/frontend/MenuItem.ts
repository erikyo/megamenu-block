import { calcNewPosition, setNewPosition } from '../utils';

export class MenuItem {
	dropdown: HTMLElement | null;
	fullWidthDropdown: boolean;
	level: number;
	private isOpened: boolean;

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
		this.dropdown = this.el.querySelector(
			'.wp-block-megamenu-item__dropdown'
		);
		this.isOpened = false;
	}

	getRootEl() {
		// the menu item, in case of root menu item fallbacks to wp-block-megamenu-item__content
		this.el.classList.contains( 'has-children' )
			? this.el
			: this.el.closest( '.has-children' );
	}

	/**
	 * Helper function to open a menu item.
	 */
	open() {
		/* Close the remaining elements */
		const parentElements =
			this.el?.parentElement?.querySelectorAll( '.is-opened' );
		if ( parentElements ) {
			parentElements.forEach( ( el ) => {
				el.classList.remove( 'is-opened' );
				el.classList.remove( 'is-left' );
			} );
		}

		this.el?.classList.add( 'is-opened' );
		this.el?.classList.remove( 'is-left' );
	}

	/**
	 * Helper function to close a menu item.
	 */
	close() {
		if (
			this.dropdown &&
			this.dropdown.classList.contains( 'is-opened' )
		) {
			this.dropdown.classList.remove( 'is-opened' );
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
