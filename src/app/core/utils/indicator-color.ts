/** Paleta del semaforo de indicadores, alineada con los colores de Ant Design. */
export const INDICATOR_COLORS = {
  blue: '#1890ff',
  green: '#52c41a',
  red: '#ff4d4f',
  orange: '#fa8c16',
  /** Indicador no calculable (el backend devolvio null). */
  gray: '#bfbfbf',
} as const;

/**
 * Color del CPI: `= 1` azul, `> 1` verde, `< 1` rojo.
 *
 * Un CPI `null` (AC = 0, indicador no calculable) se pinta gris para distinguir "sin dato" de
 * cualquier valor real.
 */
export function cpiColor(cpi: number | null | undefined): string {
  if (cpi === null || cpi === undefined) {
    return INDICATOR_COLORS.gray;
  }
  if (cpi === 1) {
    return INDICATOR_COLORS.blue;
  }
  return cpi > 1 ? INDICATOR_COLORS.green : INDICATOR_COLORS.red;
}

/** Color del SPI: `= 1` azul, `> 1` verde, `< 1` naranja. `null` gris. */
export function spiColor(spi: number | null | undefined): string {
  if (spi === null || spi === undefined) {
    return INDICATOR_COLORS.gray;
  }
  if (spi === 1) {
    return INDICATOR_COLORS.blue;
  }
  return spi > 1 ? INDICATOR_COLORS.green : INDICATOR_COLORS.orange;
}
