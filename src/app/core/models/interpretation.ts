/** Las seis cadenas exactas que el backend puede devolver en `cpiVsSpiAnalysis`. */
export type CpiVsSpiAnalysis =
  | 'Proyecto ideal'
  | 'Proyecto crítico'
  | 'Proyecto con mayor gasto y retrasado'
  | 'Rápido avance a mayor costo'
  | 'Proyecto conforme a lo planeado'
  | 'No calculable';

/** Espejo de `InterpretationResponse`: la lectura de negocio del CPI y el SPI. */
export interface Interpretation {
  activityId: number;
  activityName: string;
  cpi: number | null;
  spi: number | null;
  cpiStatus: string;
  spiStatus: string;
  cpiVsSpiAnalysis: CpiVsSpiAnalysis | string;
}
