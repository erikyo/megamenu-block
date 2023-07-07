export function calcNewPosition(
	rootBlockNode: { x:number, width: number },
	blockNode: { x: number },
	dropdownMaxWidth: number = 2000
): { left: number; width: number } {
	let left = -( blockNode.x - rootBlockNode.x );

	if ( dropdownMaxWidth && rootBlockNode.width > dropdownMaxWidth ) {
		left = left + ( rootBlockNode.width - dropdownMaxWidth ) / 2;
	}

	return { left, width: rootBlockNode.width };
}
