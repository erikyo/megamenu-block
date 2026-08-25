import { store, getContext, getElement } from '@wordpress/interactivity';
import './style.scss';

store( 'megamenu', {
	state: {
		isMobileMenuOpen: false,
		currentLevel: 0,
	},
	actions: {
		toggleMobileMenu: () => {
			const context = getContext();
			const state = store( 'megamenu' ).state;
			const { ref } = getElement();

			if ( state.currentLevel === 0 ) {
				state.isMobileMenuOpen = true;
				state.currentLevel = 1;
			} else {
				state.isMobileMenuOpen = false;
				state.currentLevel = 0;
			}

			// Toggle body scroll
			if ( state.isMobileMenuOpen ) {
				document.body.style.overflow = 'hidden';
			} else {
				document.body.style.overflow = '';
			}
		},
		openDropdown: ( event: Event ) => {
			const context = getContext();
			const state = store( 'megamenu' ).state;
			const { ref } = getElement();

			// Close other dropdowns
			const allDropdowns = document.querySelectorAll( '.wp-block-megamenu-item__dropdown' );
			allDropdowns.forEach( ( dropdown ) => {
				if ( dropdown !== ref.nextElementSibling ) {
					dropdown.classList.remove( 'is-open' );
				}
			} );

			// Toggle current dropdown
			const dropdown = ref.nextElementSibling as HTMLElement;
			if ( dropdown ) {
				dropdown.classList.toggle( 'is-open' );
			}
		},
		closeDropdown: () => {
			const { ref } = getElement();
			const dropdown = ref.querySelector( '.wp-block-megamenu-item__dropdown' ) as HTMLElement;
			if ( dropdown ) {
				dropdown.classList.remove( 'is-open' );
			}
		},
	},
	callbacks: {
		initResponsive: () => {
			const { ref } = getElement();
			const context = getContext();
			const state = store( 'megamenu' ).state;

			const breakpoint = parseInt( ref.dataset.responsiveBreakpoint || '1023', 10 );
			const isMobile = window.innerWidth < breakpoint;

			if ( isMobile ) {
				ref.classList.add( 'is-mobile' );
			} else {
				ref.classList.remove( 'is-mobile' );
			}

			// Handle resize
			const handleResize = () => {
				const newIsMobile = window.innerWidth < breakpoint;
				if ( newIsMobile !== isMobile ) {
					if ( newIsMobile ) {
						ref.classList.add( 'is-mobile' );
					} else {
						ref.classList.remove( 'is-mobile' );
						state.isMobileMenuOpen = false;
						state.currentLevel = 0;
						document.body.style.overflow = '';
					}
				}
			};

			window.addEventListener( 'resize', handleResize );
		},
	},
} );
