/**
 * Espejo de `ActivityResponse` del microservicio ms-indicator-ev.
 *
 * Los porcentajes viajan como fraccion 0.0 - 1.0 (0.60 = 60%), tal como los valida el backend
 * (`@DecimalMin 0.0` / `@DecimalMax 1.0`), y se editan con esa misma escala en la UI.
 */
export interface Activity {
  id: number;
  name: string;
  /** BAC: presupuesto total planificado. */
  totalPlannedBudget: number;
  /** Porcentaje planificado, fraccion 0.0 - 1.0. */
  porcentPlanned: number;
  /** Porcentaje completado, fraccion 0.0 - 1.0. */
  porcentComplete: number;
  /** AC: costo real incurrido. */
  actualCost: number;
  created: string | null;
  createDate: string | null;
  createUpdate: string | null;
  createDateUpdate: string | null;
}

/** Espejo de `ActivityRequest`: lo que acepta el backend en POST y PUT. */
export interface ActivityRequest {
  name: string;
  totalPlannedBudget: number;
  porcentPlanned: number;
  porcentComplete: number;
  actualCost: number;
}
