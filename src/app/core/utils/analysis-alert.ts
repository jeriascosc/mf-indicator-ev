import type { CpiVsSpiAnalysis } from '../models/interpretation';

/** Tipos de alerta soportados por `nz-alert`. */
export type AlertType = 'success' | 'info' | 'warning' | 'error';

/**
 * Traduce el analisis combinado CPI vs SPI al tipo de alerta del "Analisis General".
 *
 * Los cuatro cuadrantes del negocio se mapean segun la regla acordada. Los dos casos restantes que
 * el backend puede emitir se cierran asi: "Proyecto conforme a lo planeado" como `info` (coherente
 * con el azul que usan CPI y SPI cuando valen exactamente 1) y "No calculable" como `warning`,
 * porque es una ausencia de dato que el usuario debe notar, no un error del sistema.
 */
export function alertTypeFor(analysis: CpiVsSpiAnalysis | string | null | undefined): AlertType {
  switch (analysis) {
    case 'Proyecto ideal':
      return 'info';
    case 'Proyecto crítico':
      return 'error';
    case 'Proyecto con mayor gasto y retrasado':
      return 'warning';
    case 'Rápido avance a mayor costo':
      return 'success';
    case 'Proyecto conforme a lo planeado':
      return 'info';
    default:
      return 'warning';
  }
}

/** Icono de `@ant-design/icons-angular` que acompana a cada tipo de alerta. */
const ALERT_ICONS: Record<AlertType, string> = {
  success: 'check-circle',
  info: 'info-circle',
  warning: 'exclamation-circle',
  error: 'close-circle',
};

/** Icono correspondiente al tipo de alerta, para mostrarlo al lado del titulo. */
export function alertIconFor(type: AlertType): string {
  return ALERT_ICONS[type];
}
