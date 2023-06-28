import {
	BaseControl,
	ColorIndicator,
	ColorPalette,
} from '@wordpress/components';

/**
 * The function `MPMegaMenuColorPalette` is a JavaScript function that renders a color palette control
 * with a label, color indicator, and options for custom colors and clearing the selection.
 * @param args - The `args` parameter is an object that contains the following properties:
 * @returns a JSX element.
 */
function MPMegaMenuColorPalette( args ) {
	const { label, color, disableCustomColors, clearable, onChange } = args;

	return (
		<BaseControl>
			<BaseControl.VisualLabel>
				{ label }
				{ color && (
					<ColorIndicator
						colorValue={ color }
						style={ {
							verticalAlign: 'text-bottom',
							background: color,
						} }
					/>
				) }
			</BaseControl.VisualLabel>
			<ColorPalette
				value={ color }
				onChange={ onChange }
				disableCustomColors={ disableCustomColors }
				clearable={ clearable }
			/>
		</BaseControl>
	);
}

export default MPMegaMenuColorPalette;
