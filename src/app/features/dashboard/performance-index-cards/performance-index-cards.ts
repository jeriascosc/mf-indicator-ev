import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { Indicator } from '../../../core/models/indicator';
import { indicatorText } from '../../../core/utils/format';
import { cpiColor, spiColor } from '../../../core/utils/indicator-color';

/** Una tarjeta del semaforo de indices. */
export interface IndexCard {
  key: 'cpi' | 'spi';
  label: string;
  value: string;
  color: string;
  status: string;
}

/**
 * Bloque independiente con el estado de CPI y SPI en cuadros redondeados.
 *
 * El color sale de las reglas de negocio: CPI `=1` azul, `>1` verde, `<1` rojo; SPI `=1` azul,
 * `>1` verde, `<1` naranja. Un indice no calculable (`null`) se muestra gris con valor `N/A`.
 */
@Component({
  selector: 'app-performance-index-cards',
  imports: [],
  templateUrl: './performance-index-cards.html',
  styleUrl: './performance-index-cards.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerformanceIndexCards {
  readonly indicator = input<Indicator | null>(null);
  readonly cpiStatus = input('');
  readonly spiStatus = input('');

  readonly cards = computed<IndexCard[]>(() => {
    const indicator = this.indicator();
    // Sin actividad seleccionada los numericos quedan en cero; con actividad, un indice nulo es
    // "no calculable" y se muestra N/A, que no es lo mismo que un cero real.
    const value = (index: number | null): string =>
      indicator === null ? indicatorText(0, 4) : indicatorText(index, 4);

    return [
      {
        key: 'cpi',
        label: 'CPI',
        value: value(indicator?.cpi ?? null),
        color: cpiColor(indicator?.cpi ?? null),
        status: this.cpiStatus(),
      },
      {
        key: 'spi',
        label: 'SPI',
        value: value(indicator?.spi ?? null),
        color: spiColor(indicator?.spi ?? null),
        status: this.spiStatus(),
      },
    ];
  });
}
