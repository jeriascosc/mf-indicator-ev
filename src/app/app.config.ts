import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { es_ES, provideNzI18n } from 'ng-zorro-antd/i18n';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { provideEchartsConfig } from './core/echarts.config';
import { provideDashboardIcons } from './core/icons.config';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideNzI18n(es_ES),
    provideDashboardIcons(),
    provideEchartsConfig(),
    // NzModalService lo provee NzModalModule, no `providedIn: 'root'`: sin esto el dashboard
    // no puede abrir el modal de creacion. NzMessageService si es root y no necesita registro.
    importProvidersFrom(NzModalModule),
  ],
};
