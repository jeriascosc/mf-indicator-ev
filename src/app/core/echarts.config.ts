import type { Provider } from '@angular/core';
import { BarChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { provideEchartsCore } from 'ngx-echarts';

/**
 * Build de ECharts recortado a lo que el dashboard dibuja: barras (PV vs EV) y donuts de avance.
 * Importar `echarts` completo triplicaria el bundle sin aportar nada.
 */
echarts.use([
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer,
]);

export function provideEchartsConfig(): Provider {
  return provideEchartsCore({ echarts });
}
