import { calcNewPosition, setNewPosition } from '../utils';

export class MenuItem {
	dropdown: HTMLElement | null;
	fullWidthDropdown: boolean;
	isOpened: boolean = false;
	hasChildren: any;
	button: HTMLElement;
	private isFetched: boolean = false;
	private isLoading: boolean = false;

	constructor(
		public el: HTMLElement,
		public args?: {
			fullWidthDropdown?: boolean;
			parent?: HTMLElement;
		}
	) {
		this.el = el;
		this.fullWidthDropdown = args?.fullWidthDropdown ?? false;
		this.button =
			this.el.querySelector( '.wp-block-megamenu-item__link' ) ||
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
	async open( megamenuRect?: DOMRect, maxBodyWidth?: number ) {
		this.isOpened = true;
		this.el?.classList.add( 'is-opened' );
		this.dropdown?.classList.add( 'is-active' );
		this.el?.classList.remove( 'is-left' );

		// Hydrate submenu content if needed
		if ( this.hasChildren && this.dropdown && ! this.isFetched && ! this.isLoading ) {
			await this.hydrateSubmenu();

			// Update dropdown position after content is injected
			if ( megamenuRect && maxBodyWidth !== undefined ) {
				this.updateDropdownPosition( megamenuRect, maxBodyWidth );
			}
		}
	}

	/**
	 * Async function to fetch and hydrate submenu content from REST API.
	 */
	private async hydrateSubmenu(): Promise<void> {
		const submenuId = this.el.dataset.submenuId;

		if ( ! submenuId ) {
			return;
		}

		this.isLoading = true;
		this.dropdown?.classList.add( 'is-loading' );

		try {
			// Dynamically extract the correct REST base URL (handles subdirectories & multilingual prefixes)
			const restLink = document.querySelector<HTMLLinkElement>( 'link[rel="https://api.w.org/"]' );
			const baseUrl = restLink ? restLink.href : '/wp-json/';

			// Ensure no double slashes when appending the custom route
			let endpointUrl = `${ baseUrl.replace( /\/$/, '' ) }/megamenu/v1/submenu/${ submenuId }`;

			// Append language parameter if Polylang language context is available
			const lang = this.el.dataset.lang;
			if ( lang ) {
				endpointUrl += `?lang=${ lang }`;
			}

			const response = await window.fetch( endpointUrl );

			if ( ! response.ok ) {
				throw new Error( `HTTP error! status: ${ response.status }` );
			}

			const data = await response.json();

			if ( this.dropdown && data.html ) {
				this.dropdown.innerHTML = data.html;
			}
		} catch ( error ) {
			console.error( 'Failed to fetch submenu content:', error );
		} finally {
			this.isLoading = false;
			this.isFetched = true;
			this.dropdown?.classList.remove( 'is-loading' );
		}
	}

	/**
	 * Helper function to close a menu item.
	 */
	close() {
		if ( this.el && this.isOpened ) {
			this.isOpened = false;
			this.dropdown?.classList.remove( 'is-active' );
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
