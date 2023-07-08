export function calcNewPosition(
	rootBlockNode: { x: number; width: number } | DOMRect,
	blockNode: { x: number } | DOMRect,
	dropdownMaxWidth: number = 2000
): { left: number; width: number } {
	let left = -( blockNode.x - rootBlockNode.x );

	if ( dropdownMaxWidth && rootBlockNode.width > dropdownMaxWidth ) {
		left = left + ( rootBlockNode.width - dropdownMaxWidth ) / 2;
	}

	return { left, width: rootBlockNode.width };
}

export function setDropdownStyle(
	dropdown: { style: { left: string; width: string; maxWidth: string } },
	{ left, width, maxWidth }: any
) {
	dropdown.style.left = `${ left }px`;
	dropdown.style.width = `${ width }px`;
	dropdown.style.maxWidth = `${ maxWidth }px`;
}
