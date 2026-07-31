import type { Activity } from '../core/models/activity';
import type { Indicator } from '../core/models/indicator';
import type { Interpretation } from '../core/models/interpretation';

/**
 * Constructores de datos de prueba alineados con `data.sql` del backend: BAC 10000 en todos los
 * registros, para que las cifras de los asserts sean faciles de contrastar a mano.
 */
export function makeActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: 1,
    name: 'Cimentacion',
    totalPlannedBudget: 10000,
    porcentPlanned: 0.5,
    porcentComplete: 0.6,
    actualCost: 5000,
    created: 'system',
    createDate: '2026-07-29T10:00:00',
    createUpdate: null,
    createDateUpdate: null,
    ...overrides,
  };
}

export function makeIndicator(overrides: Partial<Indicator> = {}): Indicator {
  return {
    activityId: 1,
    activityName: 'Cimentacion',
    bac: 10000,
    pv: 5000,
    ev: 6000,
    cv: 1000,
    sv: 1000,
    cpi: 1.2,
    spi: 1.2,
    eac: 8333.3333,
    vac: 1666.6667,
    ...overrides,
  };
}

export function makeInterpretation(overrides: Partial<Interpretation> = {}): Interpretation {
  return {
    activityId: 1,
    activityName: 'Cimentacion',
    cpi: 1.2,
    spi: 1.2,
    cpiStatus: 'Eficiencia de Costo',
    spiStatus: 'Avanza más de lo previsto',
    cpiVsSpiAnalysis: 'Proyecto ideal',
    ...overrides,
  };
}
