import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { Indicator } from '../../../core/models/indicator';
import { indicatorText } from '../../../core/utils/format';

/** Un circulo del bloque "Otros indicadores". */
export interface OtherIndicator {
  key: 'cv' | 'sv' | 'eac' | 'vac';
  label: string;
  value: string;
}

/**
 * Bloque "Otros indicadores": CV, SV, EAC y VAC en circulos.
 *
 * `eac` y `vac` dependen del CPI, asi que llegan `null` cuando el CPI no es calculable; en ese caso
 * se muestran como `N/A` en lugar de un cero que se leeria como un valor real.
 */
@Component({
  selector: 'app-other-indicators',
  imports: [],
  templateUrl: './other-indicators.html',
  styleUrl: './other-indicators.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtherIndicators {
  readonly indicator = input<Indicator | null>(null);

  readonly items = computed<OtherIndicator[]>(() => {
    const indicator = this.indicator();
    // Sin actividad seleccionada los numericos quedan en cero; con actividad, un indicador nulo es
    // "no calculable" y se muestra N/A.
    const value = (raw: number | null): string =>
      indicator === null ? indicatorText(0) : indicatorText(raw);

    return [
      { key: 'cv', label: 'CV', value: value(indicator?.cv ?? null) },
      { key: 'sv', label: 'SV', value: value(indicator?.sv ?? null) },
      { key: 'eac', label: 'EAC', value: value(indicator?.eac ?? null) },
      { key: 'vac', label: 'VAC', value: value(indicator?.vac ?? null) },
    ];
  });
}
