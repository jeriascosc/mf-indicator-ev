import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { EChartsCoreOption } from 'echarts/core';
import { NgxEchartsDirective } from 'ngx-echarts';

import type { Activity } from '../../../core/models/activity';
import type { Indicator } from '../../../core/models/indicator';
import { fractionAsPercent, numberOrZero } from '../../../core/utils/format';

/** Color del avance planificado, alineado con la barra PV. */
export const PLANNED_COLOR = '#1890ff';
/** Color del avance ejecutado, alineado con la barra EV. */
export const COMPLETE_COLOR = '#722ed1';
/** Gris del tramo pendiente del BAC. */
export const REMAINING_COLOR = '#f0f0f0';

/** Un donut de avance sobre el BAC. */
export interface ProgressDonut {
  key: 'planned' | 'complete';
  title: string;
  percentText: string;
  option: EChartsCoreOption;
}

/**
 * Los dos donuts de avance: porcentaje planeado y porcentaje ejecutado, ambos medidos sobre el
 * presupuesto total planificado (BAC).
 */
@Component({
  selector: 'app-progress-donuts',
  imports: [NgxEchartsDirective],
  templateUrl: './progress-donuts.html',
  styleUrl: './progress-donuts.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressDonuts {
  readonly activity = input<Activity | null>(null);
  readonly indicator = input<Indicator | null>(null);

  /** BAC tomado del indicador y, si no hay, del propio registro de la actividad. */
  readonly bac = computed(() =>
    numberOrZero(this.indicator()?.bac ?? this.activity()?.totalPlannedBudget),
  );

  readonly donuts = computed<ProgressDonut[]>(() => {
    const bac = this.bac();
    const porcentPlanned = numberOrZero(this.activity()?.porcentPlanned);
    const porcentComplete = numberOrZero(this.activity()?.porcentComplete);

    return [
      this.buildDonut(
        'planned',
        'Avance porcentaje planeado',
        porcentPlanned,
        bac,
        PLANNED_COLOR,
        'Planeado',
      ),
      this.buildDonut(
        'complete',
        'Avance porcentaje ejecutado',
        porcentComplete,
        bac,
        COMPLETE_COLOR,
        'Ejecutado',
      ),
    ];
  });

  private buildDonut(
    key: ProgressDonut['key'],
    title: string,
    fraction: number,
    bac: number,
    color: string,
    seriesLabel: string,
  ): ProgressDonut {
    const advanced = bac * fraction;
    // Con BAC en cero las dos porciones valdrian cero y ECharts reparte el anillo en partes
    // iguales, lo que se leeria como un 50% de avance. Se fuerza el anillo completo en gris.
    const remaining = bac > 0 ? Math.max(bac - advanced, 0) : 1;
    const percentText = fractionAsPercent(fraction);

    return {
      key,
      title,
      percentText,
      option: {
        tooltip: {
          trigger: 'item',
          valueFormatter: (value: unknown) => Number(value).toLocaleString('es-CO'),
        },
        legend: { bottom: 0, data: [seriesLabel, 'Pendiente'] },
        series: [
          {
            name: title,
            type: 'pie',
            radius: ['58%', '80%'],
            center: ['50%', '45%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'center',
              formatter: percentText,
              fontSize: 22,
              fontWeight: 'bold',
              color: '#1f1f1f',
            },
            emphasis: { label: { show: true } },
            labelLine: { show: false },
            data: [
              { value: advanced, name: seriesLabel, itemStyle: { color } },
              { value: remaining, name: 'Pendiente', itemStyle: { color: REMAINING_COLOR } },
            ],
          },
        ],
      },
    };
  }
}
