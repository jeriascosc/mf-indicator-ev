import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { makeIndicator } from '../../../testing/fixtures';
import { dashboardTestProviders } from '../../../testing/test-providers';
import { OtherIndicators } from './other-indicators';

describe('OtherIndicators', () => {
  let fixture: ComponentFixture<OtherIndicators>;

  const valueOf = (key: string): string =>
    fixture.nativeElement
      .querySelector(`[data-testid="other-value-${key}"]`)
      ?.textContent?.trim() ?? '';

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [OtherIndicators],
      providers: [dashboardTestProviders()],
    });
    fixture = TestBed.createComponent(OtherIndicators);
    await fixture.whenStable();
  });

  it('muestra el label del bloque', () => {
    expect(
      fixture.nativeElement.querySelector('[data-testid="other-indicators-label"]')?.textContent,
    ).toBe('Otros indicadores');
  });

  it('muestra CV, SV, EAC y VAC en cuatro circulos', async () => {
    fixture.componentRef.setInput(
      'indicator',
      makeIndicator({ cv: 1000, sv: -1500, eac: 8333.3333, vac: 1666.6667 }),
    );
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('.other-indicator')).toHaveLength(4);
    expect(valueOf('cv')).toBe('1.000,00');
    expect(valueOf('sv')).toBe('-1.500,00');
    expect(valueOf('eac')).toBe('8.333,33');
    expect(valueOf('vac')).toBe('1.666,67');
  });

  it('muestra N/A cuando EAC y VAC no son calculables', async () => {
    fixture.componentRef.setInput('indicator', makeIndicator({ eac: null, vac: null }));
    await fixture.whenStable();

    expect(valueOf('eac')).toBe('N/A');
    expect(valueOf('vac')).toBe('N/A');
  });

  it('sin actividad seleccionada muestra cero en los cuatro circulos', () => {
    expect(valueOf('cv')).toBe('0,00');
    expect(valueOf('sv')).toBe('0,00');
    expect(valueOf('eac')).toBe('0,00');
    expect(valueOf('vac')).toBe('0,00');
  });
});
