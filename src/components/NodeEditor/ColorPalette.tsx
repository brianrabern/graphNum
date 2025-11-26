import { getAvailableColors, getColorValue } from '../../core/math/colorMapping';
import styles from './ColorPalette.module.css';

interface ColorPaletteProps {
  selectedColor: string | null;
  onColorSelect: (color: string) => void;
}

export function ColorPalette({ selectedColor, onColorSelect }: ColorPaletteProps) {
  const colors = getAvailableColors();

  return (
    <div className={styles.palette}>
      <div className={styles.colors}>
        {colors.map(color => (
          <button
            key={color}
            className={`${styles.colorButton} ${selectedColor === color ? styles.selected : ''}`}
            style={{ backgroundColor: getColorValue(color) }}
            onClick={() => onColorSelect(color)}
            aria-label={`Select ${color} color`}
          />
        ))}
      </div>
    </div>
  );
}
