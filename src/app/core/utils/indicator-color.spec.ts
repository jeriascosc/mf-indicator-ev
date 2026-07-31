import { describe, expect, it } from 'vitest';

import { INDICATOR_COLORS, cpiColor, spiColor } from './indicator-color';

describe('cpiColor', () => {
  it('pinta azul un CPI igual a 1', () => {
    expect(cpiColor(1)).toBe(INDICATOR_COLORS.blue);
  });

  it('pinta verde un CPI mayor que 1', () => {
    expect(cpiColor(1.2)).toBe(INDICATOR_COLORS.green);
  });

  it('pinta rojo un CPI menor que 1', () => {
    expect(cpiColor(0.8)).toBe(INDICATOR_COLORS.red);
  });

  it('pinta gris un CPI no calculable', () => {
    expect(cpiColor(null)).toBe(INDICATOR_COLORS.gray);
    expect(cpiColor(undefined)).toBe(INDICATOR_COLORS.gray);
  });
});

describe('spiColor', () => {
  it('pinta azul un SPI igual a 1', () => {
    expect(spiColor(1)).toBe(INDICATOR_COLORS.blue);
  });

  it('pinta verde un SPI mayor que 1', () => {
    expect(spiColor(1.2)).toBe(INDICATOR_COLORS.green);
  });

  it('pinta naranja un SPI menor que 1', () => {
    expect(spiColor(0.8)).toBe(INDICATOR_COLORS.orange);
  });

  it('pinta gris un SPI no calculable', () => {
    expect(spiColor(null)).toBe(INDICATOR_COLORS.gray);
    expect(spiColor(undefined)).toBe(INDICATOR_COLORS.gray);
  });
});
