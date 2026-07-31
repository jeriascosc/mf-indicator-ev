/**
 * Espejo de `IndicatorResponse`: los ocho indicadores EVM de una actividad.
 *
 * `cpi`, `spi`, `eac` y `vac` llegan `null` cuando su divisor es cero (indicador no calculable);
 * el backend devuelve null explicitamente para no confundir "sin dato" con "cero".
 */
export interface Indicator {
  activityId: number;
  activityName: string;
  /** BAC: presupuesto total planificado. */
  bac: number;
  /** PV: valor planificado = porcentPlanned x BAC. */
  pv: number;
  /** EV: valor ganado = porcentComplete x BAC. */
  ev: number;
  /** CV: variacion de costo = EV - AC. */
  cv: number;
  /** SV: variacion de cronograma = EV - PV. */
  sv: number;
  /** CPI: indice de desempeno del costo = EV / AC. */
  cpi: number | null;
  /** SPI: indice de desempeno del cronograma = EV / PV. */
  spi: number | null;
  /** EAC: estimacion al completar = BAC / CPI. */
  eac: number | null;
  /** VAC: variacion al completar = BAC - EAC. */
  vac: number | null;
}
