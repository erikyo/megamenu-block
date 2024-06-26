import { DropDownCoords } from '../menu-item/types';

/**
 * Generate a random id
 * You can pass a prefix to generate a random id with a prefix
 *
 * @param prefix - The prefix to be added to the random id
 * @return A random id
 */
export function generateRandomId( prefix: string ) {
	return prefix + Math.random().toString( 36 ).substring( 2, 9 );
}

/**
 * Returns the lowest number in an array of numbers.
 * It returns `undefined` if all numbers are `undefined` or `0`.
 *
 * @param args the args parameter is an array of numbers
 * @return the lowest number in the array
 */
export function getLowestWidth(
	...args: ( number | undefined )[]
): number | undefined {
	// Filter out undefined values
	const filteredArgs = args.filter(
		( num ): num is number => num !== undefined && num !== 0
	);

	// If all values were undefined, return undefined
	if ( filteredArgs.length === 0 ) {
		return undefined;
	}

	// Return the minimum value
	return Math.min( ...filteredArgs );
}

/**
 * The function sets the left position, width, and maximum width of an HTML element.
 *
 * @param {HTMLElement}    el    The `el` parameter is an HTMLElement, which represents the element that
 *                               you want to set the new position for.
 * @param {DropDownCoords} style The `style` parameter is an object that contains three properties: `left`, `width`,
 *                               and `maxWidth`. Each property represents a CSS style value for the corresponding property of the
 *                               `el` element.
 */
export function setNewPosition( el: HTMLElement, style: DropDownCoords ) {
	Object.entries( style ).forEach( ( [ key, value ] ) => {
		// @ts-ignore
		el.style[ key as keyof CSSStyleDeclaration ] = `${ value }`;
	} );
}

/**
 * Removes specified styles from an HTML element.
 *
 * @param {HTMLElement | null} el             - The HTML element from which styles are to be removed.
 * @param {string[]}           stylesToRemove - An array of styles to remove from the element.
 */
export function removeStyles(
	el: HTMLElement | null,
	stylesToRemove: string[]
) {
	if ( ! el ) {
		return;
	}
	stylesToRemove.forEach( ( style ) => {
		el?.style && style in el.style
			? el.style.removeProperty( style )
			: null;
	} );
}

/**
 * The `delay` function is a TypeScript function that returns a promise that resolves after a specified
 * number of milliseconds.
 *
 * @param {number} ms The parameter "ms" is a number that represents the number of milliseconds to
 *                    delay before resolving the promise.
 */
export const delay = ( ms: number ) =>
	new Promise( ( resolve ) => setTimeout( resolve, ms ) );

/**
 * The function `disableBodyScroll` is used to disable scrolling on the body element and apply
 * transformations to the body and megamenu elements.
 *
 * @param [scrollDisabled=false] - A boolean value indicating whether to disable scrolling or not. If
 *                               set to true, scrolling will be disabled. If set to false, scrolling will be enabled.
 */
export function lockScroll( scrollDisabled = false ) {
	const scrollTop = window.scrollY;
	if ( scrollDisabled ) {
		document.body.dataset.scrollTop = scrollTop.toString();
	}

	if ( scrollDisabled ) {
		if ( document.body.classList.contains( 'no-scroll' ) ) {
			return;
		}
		document.body.classList.add( 'no-scroll' );
	} else {
		document.body.classList.remove( 'no-scroll' );
		window.scrollTo( { top: scrollTop } );
		document.body.removeAttribute( 'data-scroll-top' );
	}
}

/**
 * Converts the characters "&", "<", ">", '"', and "'" in a string to their corresponding HTML entities.
 *
 * @param inputString The string to be converted.
 * @return The converted string with special characters replaced by HTML entities.
 */
export function escapeHtml( inputString: string ): string {
	const htmlEntities: Record< string, string > = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&apos;',
	};

	// Regular expression to match any of the special characters
	const regex = /[&<>"']/g;

	return inputString.replace( regex, ( match ) => htmlEntities[ match ] );
}

/**
 * The `calcNewPosition` function calculates the left position, width, and maxWidth of a dropdown menu
 * based on the position and width of the root block node and a maximum width value.
 *
 * @param          items              The `items` parameter is an object that contains
 * @param          items.editorBBox
 * @param {number} [dropdownMaxWidth] The `dropdownMaxWidth` parameter is the maximum width that
 *                                    the dropdown can have. If the width of the `rootBlockNode` is greater than `dropdownMaxWidth`, the
 * @param          items.blockBBox
 *                                    dropdown will be centered within the `rootBlockNode` by adjusting the `left` value.
 * @param          fit                Whether to fit the dropdown to full width
 * @param          items.dropdownBBox The `items` parameter is an object that contains the `dropdownBBox`
 * @param          items.megamenuBBox The `items` parameter is an object that contains the `megamenuBBox`
 * @return an object with three properties: "left", "width", and "maxWidth". The values of these
 * properties are converted to strings and are based on the calculations performed in the function.
 */
export function calcNewPosition(
	items: {
		blockBBox: DOMRect;
		dropdownBBox: DOMRect;
		megamenuBBox: DOMRect;
	},
	dropdownMaxWidth: number,
	fit: boolean = true
): DropDownCoords {
	/**
	 * TO FIT the dropdown inside megamenu we need only left: 0; right: 0; width 100%
	 */
	const { blockBBox, dropdownBBox, megamenuBBox } = items;

	if ( fit ) {
		// the distance from the left edge of the root block node to the left edge of the dropdown block node
		return {
			left: `${ megamenuBBox.x * -1 }px`,
			width: `${ dropdownMaxWidth }px`,
			maxWidth: `${ dropdownMaxWidth }px`,
		};
	}

	const center = blockBBox.width / 2 - dropdownBBox.width / 2;
	const margins = {
		left: dropdownMaxWidth - megamenuBBox.left,
		right: dropdownMaxWidth - megamenuBBox.right,
	};
	console.log( center, 'margins', margins );

	if ( dropdownBBox.right > dropdownMaxWidth ) {
		return {
			right: `-${ margins.right }px`,
			maxWidth: `${ dropdownMaxWidth }px`,
		};
	}
	if ( dropdownBBox.left < 0 ) {
		return {
			left: `-${ margins.left }px`,
			maxWidth: `${ dropdownMaxWidth }px`,
		};
	}

	return {
		left: `-${ center }px`,
		maxWidth: `${ dropdownMaxWidth }px`,
	};
}

/**
 * Calculates the position of a dropdown menu based on the position and size of a megamenu item and its parent attributes.
 *
 * @param {HTMLElement}        megamenuItem                      The megamenu item element.
 * @param {HTMLDivElement}     dropdown                          The dropdown element.
 * @param {MenuItemAttributes} parentAttributes                  The attributes of the parent menu item.
 * @param                      parentAttributes.dropdownMaxWidth The maximum width of the dropdown.
 * @param                      parentAttributes.expandDropdown   Whether to expand the dropdown.
 * @return {DropDownCoords} The calculated position of the dropdown menu.
 */
export function calcPosition(
	megamenuItem: HTMLElement,
	dropdown?: HTMLElement,
	parentAttributes?: {
		expandDropdown: boolean;
	}
): DropDownCoords {
	const { expandDropdown } = parentAttributes ?? {
		expandDropdown: false,
	};

	const editorIframe: HTMLIFrameElement | null = document.querySelector(
		'.edit-site-visual-editor__editor-canvas'
	);
	const editorEl = editorIframe?.contentWindow?.document?.body;
	const dropdownEl = dropdown ?? megamenuItem.closest( '.wp-block-megamenu' );

	const items = {
		blockBBox: megamenuItem?.getBoundingClientRect() as DOMRect,
		dropdownBBox: dropdownEl?.getBoundingClientRect() as DOMRect,
		megamenuBBox: (
			megamenuItem?.closest( '.wp-block-megamenu' ) as HTMLDivElement
		 )?.getBoundingClientRect(),
	};

	return calcNewPosition(
		items,
		editorEl?.clientWidth ??
			( editorEl?.getBoundingClientRect()?.width as number ),
		expandDropdown
	);
}

/**
 * Detects whether the current device supports touch events or not.
 *
 * @return {boolean} `true` if the device supports touch events, `false` otherwise.
 */
export function detectTouchCapability(): boolean {
	// Check if the 'ontouchstart' event is supported by the browser
	const hasTouchStartEvent = 'ontouchstart' in window;

	// Check if the browser supports the 'maxTouchPoints' property
	const hasMaxTouchPoints = navigator.maxTouchPoints !== undefined;

	// If the browser supports 'maxTouchPoints', check if it is greater than 0
	const hasPositiveMaxTouchPoints =
		hasMaxTouchPoints && navigator.maxTouchPoints > 0;

	// Return true if either 'ontouchstart' is supported or 'maxTouchPoints' is greater than 0
	return hasTouchStartEvent || hasPositiveMaxTouchPoints;
}
