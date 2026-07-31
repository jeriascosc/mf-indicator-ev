import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { EChartsCoreOption } from 'echarts/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NgxEchartsDirective } from 'ngx-echarts';

import type { Indicator } from '../../../core/models/indicator';
import { numberOrZero } from '../../../core/utils/format';

/** Azul de Ant Design para el valor planificado. */
export const PV_COLOR = '#1890ff';
/** Violeta para el valor ganado. */
export const EV_COLOR = '#722ed1';

/**
 * Grafica de barras que compara el avance planificado (PV) con el ejecutado (EV).
 *
 * Sin actividad seleccionada las barras quedan en cero, no desaparecen, para que el bloque
 * conserve su tamanio y el usuario vea que no hay datos en lugar de un hueco.
 */
@Component({
  selector: 'app-planned-vs-executed-chart',
  imports: [NzIconModule, NgxEchartsDirective],
  templateUrl: './planned-vs-executed-chart.html',
  styleUrl: './planned-vs-executed-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannedVsExecutedChart {
  readonly indicator = input<Indicator | null>(null);

  readonly pv = computed(() => numberOrZero(this.indicator()?.pv));
  readonly ev = computed(() => numberOrZero(this.indicator()?.ev));

  readonly chartOption = computed<EChartsCoreOption>(() => ({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['PV', 'EV'], bottom: 0 },
    // ECharts 6 deprecó `containLabel`: se reserva el margen a mano para las etiquetas del eje.
    grid: { left: 80, right: 24, top: 24, bottom: 56 },
    xAxis: { type: 'category', data: ['Avance'] },
    yAxis: { type: 'value', name: 'Valor' },
    series: [
      {
        name: 'PV',
        type: 'bar',
        barGap: '20%',
        barMaxWidth: 72,
        itemStyle: { color: PV_COLOR, borderRadius: [4, 4, 0, 0] },
        label: { show: true, position: 'top' },
        data: [this.pv()],
      },
      {
        name: 'EV',
        type: 'bar',
        barMaxWidth: 72,
        itemStyle: { color: EV_COLOR, borderRadius: [4, 4, 0, 0] },
        label: { show: true, position: 'top' },
        data: [this.ev()],
      },
    ],
  }));
}
