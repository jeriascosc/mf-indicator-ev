import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzIconModule } from 'ng-zorro-antd/icon';

import type { Interpretation } from '../../../core/models/interpretation';
import { type AlertType, alertIconFor, alertTypeFor } from '../../../core/utils/analysis-alert';
import { NOT_AVAILABLE } from '../../../core/utils/format';

/**
 * Alert de ancho completo con el diagnostico de la actividad seleccionada.
 *
 * Titulo fijo "Analisis General", icono segun el tipo de alert y, como subtitulo, el analisis
 * combinado CPI vs SPI que devuelve `GET /activities/{id}/interpretation`.
 */
@Component({
  selector: 'app-general-analysis-alert',
  imports: [NzAlertModule, NzIconModule],
  templateUrl: './general-analysis-alert.html',
  styleUrl: './general-analysis-alert.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralAnalysisAlert {
  readonly interpretation = input<Interpretation | null>(null);

  readonly alertType = computed<AlertType>(() =>
    alertTypeFor(this.interpretation()?.cpiVsSpiAnalysis),
  );

  readonly alertIcon = computed(() => alertIconFor(this.alertType()));

  readonly analysis = computed(() => this.interpretation()?.cpiVsSpiAnalysis ?? NOT_AVAILABLE);

  /** Detalle de apoyo: estado de costo y de cronograma, cuando hay interpretacion. */
  readonly statusDetail = computed(() => {
    const interpretation = this.interpretation();
    if (!interpretation) {
      return null;
    }
    return `CPI: ${interpretation.cpiStatus} · SPI: ${interpretation.spiStatus}`;
  });
}
