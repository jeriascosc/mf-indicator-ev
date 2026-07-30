import { describe, expect, it } from 'vitest';

import { makeActivity } from '../../testing/fixtures';
import { latestActivity } from './latest-activity';

describe('latestActivity', () => {
  it('devuelve null cuando no hay actividades', () => {
    expect(latestActivity([])).toBeNull();
  });

  it('elige la actividad con createDate mas reciente', () => {
    const older = makeActivity({ id: 9, createDate: '2026-07-01T08:00:00' });
    const newer = makeActivity({ id: 2, createDate: '2026-07-28T08:00:00' });

    expect(latestActivity([older, newer])?.id).toBe(2);
  });

  it('desempata por id cuando el createDate es identico', () => {
    const first = makeActivity({ id: 3, createDate: '2026-07-29T10:00:00' });
    const last = makeActivity({ id: 6, createDate: '2026-07-29T10:00:00' });

    expect(latestActivity([first, last])?.id).toBe(6);
  });

  it('desempata por id cuando falta el createDate', () => {
    const withoutDate = makeActivity({ id: 4, createDate: null });
    const alsoWithoutDate = makeActivity({ id: 7, createDate: null });

    expect(latestActivity([withoutDate, alsoWithoutDate])?.id).toBe(7);
  });

  it('funciona con una sola actividad', () => {
    expect(latestActivity([makeActivity({ id: 42 })])?.id).toBe(42);
  });
});
