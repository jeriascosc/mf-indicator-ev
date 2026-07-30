import { describe, expect, it } from 'vitest';

import { NOT_AVAILABLE, fractionAsPercent, indicatorText, numberOrZero, textOrNa } from './format';

describe('indicatorText', () => {
  it('formatea el valor con los decimales pedidos', () => {
    expect(indicatorText(1666.6667)).toBe('1.666,67');
    expect(indicatorText(1.2, 4)).toBe('1,2000');
  });

  it('devuelve N/A para un indicador no calculable', () => {
    expect(indicatorText(null)).toBe(NOT_AVAILABLE);
    expect(indicatorText(undefined)).toBe(NOT_AVAILABLE);
    expect(indicatorText(Number.NaN)).toBe(NOT_AVAILABLE);
  });

  it('muestra el cero como cero, no como N/A', () => {
    expect(indicatorText(0)).toBe('0,00');
  });
});

describe('numberOrZero', () => {
  it('conserva el numero recibido', () => {
    expect(numberOrZero(1500.5)).toBe(1500.5);
    expect(numberOrZero(0)).toBe(0);
  });

  it('colapsa a cero lo que no es numero', () => {
    expect(numberOrZero(null)).toBe(0);
    expect(numberOrZero(undefined)).toBe(0);
    expect(numberOrZero(Number.NaN)).toBe(0);
  });
});

describe('textOrNa', () => {
  it('conserva el texto con contenido', () => {
    expect(textOrNa('Cimentacion')).toBe('Cimentacion');
  });

  it('devuelve N/A para texto ausente o en blanco', () => {
    expect(textOrNa(null)).toBe(NOT_AVAILABLE);
    expect(textOrNa(undefined)).toBe(NOT_AVAILABLE);
    expect(textOrNa('   ')).toBe(NOT_AVAILABLE);
  });
});

describe('fractionAsPercent', () => {
  it('convierte la fraccion del backend a porcentaje legible', () => {
    expect(fractionAsPercent(0.455)).toBe('45,5%');
    expect(fractionAsPercent(1)).toBe('100,0%');
    expect(fractionAsPercent(0)).toBe('0,0%');
  });

  it('devuelve N/A cuando no hay fraccion', () => {
    expect(fractionAsPercent(null)).toBe(NOT_AVAILABLE);
    expect(fractionAsPercent(undefined)).toBe(NOT_AVAILABLE);
    expect(fractionAsPercent(Number.NaN)).toBe(NOT_AVAILABLE);
  });
});
