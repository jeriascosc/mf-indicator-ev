/** Texto mostrado cuando no hay dato disponible. */
export const NOT_AVAILABLE = 'N/A';

/**
 * Presentacion de un indicador numerico.
 *
 * Cuando el backend devuelve `null` (indicador no calculable) se muestra `N/A`; cuando simplemente
 * no hay actividad seleccionada el llamador pasa `0` y se ve un cero, que es el comportamiento
 * pedido para la pantalla vacia.
 */
export function indicatorText(value: number | null | undefined, fractionDigits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return NOT_AVAILABLE;
  }
  return value.toLocaleString('es-CO', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

/** Numero listo para calculos: `null`/`undefined` colapsan a cero. */
export function numberOrZero(value: number | null | undefined): number {
  return value === null || value === undefined || Number.isNaN(value) ? 0 : value;
}

/** Texto listo para mostrar: vacio o ausente se convierte en `N/A`. */
export function textOrNa(value: string | null | undefined): string {
  return value === null || value === undefined || value.trim() === '' ? NOT_AVAILABLE : value;
}

/** Fraccion 0.0 - 1.0 formateada como porcentaje legible (0.455 -> "45,5%"). */
export function fractionAsPercent(value: number | null | undefined, fractionDigits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return NOT_AVAILABLE;
  }
  return `${(value * 100).toLocaleString('es-CO', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}%`;
}
