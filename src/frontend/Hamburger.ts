import { disableBodyScroll } from '../utils';

export class Hamburger {
	el: HTMLElement;

	constructor( root: HTMLElement ) {
		this.el = root.nextElementSibling as HTMLElement;
	}

	status( status: string ) {
		for ( const className of this.el.classList ) {
			if (
				className.startsWith( 'is-state' ) &&
				className !== 'is-' + status
			) {
				this.el.classList.remove( className );
			}
		}
		this.el.classList.add( 'is-' + status );
	}

	display( display: boolean = true ) {
		if ( display ) {
			this.el.classList.remove( 'is-hidden' );
		} else {
			this.el.classList.add( 'is-hidden' );
		}
	}

	/**
	 * The function toggles the visibility of a responsive menu and changes the state of a hamburger icon.
	 * furthermore, it disables/enables the body scroll.
	 * @param level
	 */
	updateState( level: number ) {
		if ( level > 1 ) {
			this.status( 'state-open' );
		} else if ( level === 1 ) {
			this.status( 'state-back' );
		} else {
			this.status( 'state-close' );
		}
	}

	disableBodyScroll() {
		disableBodyScroll( true );
	}

	enableBodyScroll() {
		disableBodyScroll( false );
	}
}
