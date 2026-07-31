import { es_ES, provideNzI18n } from 'ng-zorro-antd/i18n';

import { provideDashboardIcons } from '../core/icons.config';

/**
 * Providers minimos que necesitan los componentes NG-ZORRO en los specs: los iconos registrados de
 * forma estatica (si no, `NzIconService` intenta descargarlos por HTTP) y el locale espaniol, que es
 * el que da formato a los textos de nz-table y nz-select.
 */
export function dashboardTestProviders() {
  return [provideNzI18n(es_ES), provideDashboardIcons()];
}
