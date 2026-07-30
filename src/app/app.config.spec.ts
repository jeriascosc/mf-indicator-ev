import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { NzIconService } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { beforeEach, describe, expect, it } from 'vitest';

import { appConfig } from './app.config';

describe('appConfig', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: appConfig.providers });
  });

  it('deja HttpClient disponible para el servicio de API', () => {
    expect(TestBed.inject(HttpClient)).toBeTruthy();
  });

  it('registra el router con la ruta del dashboard', () => {
    expect(TestBed.inject(Router).config.map((route) => route.path)).toEqual(['', '**']);
  });

  it('configura el locale espaniol de NG-ZORRO', () => {
    expect(TestBed.inject(NZ_I18N)).toBeTruthy();
  });

  it('registra estaticamente los iconos que usa la pantalla', () => {
    expect(TestBed.inject(NzIconService)).toBeTruthy();
  });

  it('provee el core recortado de ECharts a ngx-echarts', () => {
    expect(TestBed.inject(NGX_ECHARTS_CONFIG).echarts).toBeTruthy();
  });

  // NzModalService no es `providedIn: 'root'`; sin NzModalModule el boton Agregar rompe en runtime.
  it('deja NzModalService y NzMessageService inyectables', () => {
    expect(TestBed.inject(NzModalService)).toBeTruthy();
    expect(TestBed.inject(NzMessageService)).toBeTruthy();
  });
});
