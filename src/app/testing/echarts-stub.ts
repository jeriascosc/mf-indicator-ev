import { Directive, input } from '@angular/core';
import type { EChartsCoreOption } from 'echarts/core';

/**
 * Reemplazo de `NgxEchartsDirective` para los specs.
 *
 * ECharts necesita un `CanvasRenderingContext2D` real y jsdom no lo provee, asi que renderizar el
 * grafico de verdad haria fallar el spec. Con este stub el componente se monta igual y la opcion
 * generada queda accesible para verificarla.
 */
@Directive({ selector: '[echarts]' })
export class EchartsStub {
  readonly options = input<EChartsCoreOption>();
  readonly merge = input<EChartsCoreOption>();
  readonly loading = input(false);
  readonly autoResize = input(true);
}
