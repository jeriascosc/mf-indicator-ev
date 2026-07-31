import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { INDICATOR_COLORS } from '../../../core/utils/indicator-color';
import { makeIndicator } from '../../../testing/fixtures';
import { dashboardTestProviders } from '../../../testing/test-providers';
import { PerformanceIndexCards } from './performance-index-cards';

describe('PerformanceIndexCards', () => {
  let fixture: ComponentFixture<PerformanceIndexCards>;

  const colorOf = (key: 'cpi' | 'spi'): string | null =>
    fixture.nativeElement
      .querySelector(`[data-testid="index-card-${key}"]`)
      ?.getAttribute('data-color') ?? null;

  const valueOf = (key: 'cpi' | 'spi'): string =>
    fixture.nativeElement
      .querySelector(`[data-testid="index-value-${key}"]`)
      ?.textContent?.trim() ?? '';

  const setIndicator = async (cpi: number | null, spi: number | null): Promise<void> => {
    fixture.componentRef.setInput('indicator', makeIndicator({ cpi, spi }));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [PerformanceIndexCards],
      providers: [dashboardTestProviders()],
    });
    fixture = TestBed.createComponent(PerformanceIndexCards);
    await fixture.whenStable();
  });

  it('pinta ambas tarjetas de azul cuando los indices valen 1', async () => {
    await setIndicator(1, 1);

    expect(colorOf('cpi')).toBe(INDICATOR_COLORS.blue);
    expect(colorOf('spi')).toBe(INDICATOR_COLORS.blue);
  });

  it('pinta ambas tarjetas de verde cuando los indices son mayores que 1', async () => {
    await setIndicator(1.25, 1.2);

    expect(colorOf('cpi')).toBe(INDICATOR_COLORS.green);
    expect(colorOf('spi')).toBe(INDICATOR_COLORS.green);
  });

  it('pinta el CPI de rojo y el SPI de naranja cuando son menores que 1', async () => {
    await setIndicator(0.8, 0.8);

    expect(colorOf('cpi')).toBe(INDICATOR_COLORS.red);
    expect(colorOf('spi')).toBe(INDICATOR_COLORS.orange);
  });

  it('muestra el valor con cuatro decimales', async () => {
    await setIndicator(1.2, 0.75);

    expect(valueOf('cpi')).toBe('1,2000');
    expect(valueOf('spi')).toBe('0,7500');
  });

  it('muestra N/A en gris cuando el indice no es calculable', async () => {
    await setIndicator(null, null);

    expect(colorOf('cpi')).toBe(INDICATOR_COLORS.gray);
    expect(colorOf('spi')).toBe(INDICATOR_COLORS.gray);
    expect(valueOf('cpi')).toBe('N/A');
    expect(valueOf('spi')).toBe('N/A');
  });

  it('sin actividad seleccionada deja las tarjetas en gris con los numericos en cero', async () => {
    fixture.componentRef.setInput('indicator', null);
    await fixture.whenStable();

    expect(colorOf('cpi')).toBe(INDICATOR_COLORS.gray);
    expect(colorOf('spi')).toBe(INDICATOR_COLORS.gray);
    expect(valueOf('cpi')).toBe('0,0000');
    expect(valueOf('spi')).toBe('0,0000');
  });

  it('muestra el estado de negocio recibido junto a cada indice', async () => {
    fixture.componentRef.setInput('indicator', makeIndicator());
    fixture.componentRef.setInput('cpiStatus', 'Eficiencia de Costo');
    fixture.componentRef.setInput('spiStatus', 'Avanza más de lo previsto');
    await fixture.whenStable();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Eficiencia de Costo');
    expect(text).toContain('Avanza más de lo previsto');
  });
});
