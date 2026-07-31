import { describe, expect, it } from 'vitest';

import { type AlertType, alertIconFor, alertTypeFor } from './analysis-alert';

describe('alertTypeFor', () => {
  const cases: ReadonlyArray<[string, AlertType]> = [
    ['Proyecto ideal', 'info'],
    ['Proyecto crítico', 'error'],
    ['Proyecto con mayor gasto y retrasado', 'warning'],
    ['Rápido avance a mayor costo', 'success'],
    ['Proyecto conforme a lo planeado', 'info'],
    ['No calculable', 'warning'],
  ];

  it.each(cases)('mapea "%s" a la alerta %s', (analysis, expected) => {
    expect(alertTypeFor(analysis)).toBe(expected);
  });

  it('cae a warning cuando no hay interpretacion', () => {
    expect(alertTypeFor(null)).toBe('warning');
    expect(alertTypeFor(undefined)).toBe('warning');
  });

  it('cae a warning ante un analisis desconocido', () => {
    expect(alertTypeFor('Texto inesperado del backend')).toBe('warning');
  });
});

describe('alertIconFor', () => {
  it('devuelve el icono de cada tipo de alerta', () => {
    expect(alertIconFor('success')).toBe('check-circle');
    expect(alertIconFor('info')).toBe('info-circle');
    expect(alertIconFor('warning')).toBe('exclamation-circle');
    expect(alertIconFor('error')).toBe('close-circle');
  });
});
