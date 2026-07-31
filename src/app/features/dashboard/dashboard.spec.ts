import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NgxEchartsDirective } from 'ngx-echarts';
import { Observable, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Activity, ActivityRequest } from '../../core/models/activity';
import type { Indicator } from '../../core/models/indicator';
import type { Interpretation } from '../../core/models/interpretation';
import { DashboardStore } from '../../core/services/dashboard-store';
import { EchartsStub } from '../../testing/echarts-stub';
import { makeActivity, makeIndicator, makeInterpretation } from '../../testing/fixtures';
import { dashboardTestProviders } from '../../testing/test-providers';
import { Dashboard } from './dashboard';
import { PlannedVsExecutedChart } from './planned-vs-executed-chart/planned-vs-executed-chart';
import { ProgressDonuts } from './progress-donuts/progress-donuts';

/** Doble del store: signals escribibles desde el spec y espias en las acciones. */
class FakeDashboardStore {
  readonly activitiesSignal = signal<readonly Activity[]>([]);
  readonly selectedIdSignal = signal<number | null>(null);
  readonly indicatorSignal = signal<Indicator | null>(null);
  readonly interpretationSignal = signal<Interpretation | null>(null);
  readonly loadingSignal = signal(false);
  readonly errorSignal = signal<string | null>(null);

  readonly activities = this.activitiesSignal.asReadonly();
  readonly selectedId = this.selectedIdSignal.asReadonly();
  readonly indicator = this.indicatorSignal.asReadonly();
  readonly interpretation = this.interpretationSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly selected = signal<Activity | null>(null).asReadonly();

  readonly load = vi.fn(() => Promise.resolve());
  readonly select = vi.fn(() => Promise.resolve());
  readonly create = vi.fn(() => Promise.resolve(true));
  readonly update = vi.fn(() => Promise.resolve(true));
  readonly remove = vi.fn(() => Promise.resolve(true));
}

describe('Dashboard', () => {
  let fixture: ComponentFixture<Dashboard>;
  let component: Dashboard;
  let store: FakeDashboardStore;
  let modalCreate: ReturnType<typeof vi.fn>;
  let afterClose: Observable<ActivityRequest | undefined>;
  let message: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  const request: ActivityRequest = {
    name: 'Nueva actividad',
    totalPlannedBudget: 20000,
    porcentPlanned: 0.4,
    porcentComplete: 0.35,
    actualCost: 7000,
  };

  beforeEach(async () => {
    store = new FakeDashboardStore();
    afterClose = of(undefined);
    modalCreate = vi.fn(() => ({ afterClose }));
    message = { success: vi.fn(), error: vi.fn() };

    TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        dashboardTestProviders(),
        { provide: DashboardStore, useValue: store },
        { provide: NzModalService, useValue: { create: modalCreate } },
        { provide: NzMessageService, useValue: message },
      ],
    });
    // Los dos bloques con graficas usan ECharts, que no puede pintar sobre jsdom.
    TestBed.overrideComponent(PlannedVsExecutedChart, {
      remove: { imports: [NgxEchartsDirective] },
      add: { imports: [EchartsStub] },
    });
    TestBed.overrideComponent(ProgressDonuts, {
      remove: { imports: [NgxEchartsDirective] },
      add: { imports: [EchartsStub] },
    });

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('al arrancar carga la lista sin forzar seleccion, para quedarse en la ultima creada', () => {
    expect(store.load).toHaveBeenCalledTimes(1);
    expect(store.load).toHaveBeenCalledWith();
  });

  it('renderiza los siete bloques de la pantalla', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('app-general-analysis-alert')).not.toBeNull();
    expect(host.querySelector('app-activity-selector')).not.toBeNull();
    expect(host.querySelector('app-performance-index-cards')).not.toBeNull();
    expect(host.querySelector('app-planned-vs-executed-chart')).not.toBeNull();
    expect(host.querySelector('app-progress-donuts')).not.toBeNull();
    expect(host.querySelector('app-other-indicators')).not.toBeNull();
    expect(host.querySelector('app-activity-table')).not.toBeNull();
  });

  it('propaga la interpretacion y los indicadores del store a los bloques', async () => {
    store.interpretationSignal.set(makeInterpretation({ cpiVsSpiAnalysis: 'Proyecto crítico' }));
    store.indicatorSignal.set(makeIndicator({ cpi: 0.8, spi: 0.8 }));
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    expect(
      host.querySelector('[data-testid="general-analysis-subtitle"]')?.textContent?.trim(),
    ).toBe('Proyecto crítico');
    expect(host.querySelector('[data-testid="index-value-cpi"]')?.textContent?.trim()).toBe(
      '0,8000',
    );
  });

  it('un cambio en el droplist selecciona la actividad en el store', () => {
    component.onActivitySelected(5);

    expect(store.select).toHaveBeenCalledWith(5);
  });

  it('el modal cancelado no crea nada', () => {
    afterClose = of(undefined);

    component.openCreateModal();

    expect(modalCreate).toHaveBeenCalled();
    expect(store.create).not.toHaveBeenCalled();
  });

  it('el modal guardado crea la actividad y avisa', async () => {
    afterClose = of(request);

    component.openCreateModal();
    await fixture.whenStable();

    expect(store.create).toHaveBeenCalledWith(request);
    expect(message.success).toHaveBeenCalledWith('Actividad creada.');
  });

  it('no avisa de exito si la creacion falla', async () => {
    afterClose = of(request);
    store.create.mockResolvedValueOnce(false);

    component.openCreateModal();
    await fixture.whenStable();

    expect(message.success).not.toHaveBeenCalled();
  });

  it('Refrescar actualiza la actividad seleccionada', async () => {
    store.selectedIdSignal.set(3);

    await component.onUpdateRequested(request);

    expect(store.update).toHaveBeenCalledWith(3, request);
    expect(message.success).toHaveBeenCalledWith('Actividad actualizada.');
  });

  it('Refrescar no hace nada sin actividad seleccionada', async () => {
    store.selectedIdSignal.set(null);

    await component.onUpdateRequested(request);

    expect(store.update).not.toHaveBeenCalled();
  });

  it('no avisa de exito si la actualizacion falla', async () => {
    store.selectedIdSignal.set(3);
    store.update.mockResolvedValueOnce(false);

    await component.onUpdateRequested(request);

    expect(message.success).not.toHaveBeenCalled();
  });

  it('Eliminar borra la actividad y avisa', async () => {
    await component.onDeleteRequested(4);

    expect(store.remove).toHaveBeenCalledWith(4);
    expect(message.success).toHaveBeenCalledWith('Actividad eliminada.');
  });

  it('no avisa de exito si el borrado falla', async () => {
    store.remove.mockResolvedValueOnce(false);

    await component.onDeleteRequested(4);

    expect(message.success).not.toHaveBeenCalled();
  });

  it('notifica los errores del store una sola vez', async () => {
    store.errorSignal.set('No fue posible cargar las actividades.');
    await fixture.whenStable();

    expect(message.error).toHaveBeenCalledWith('No fue posible cargar las actividades.');
  });

  it('sin actividades muestra N/A y ceros en la pantalla', async () => {
    store.activitiesSignal.set([]);
    store.indicatorSignal.set(null);
    store.interpretationSignal.set(null);
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    expect(
      host.querySelector('[data-testid="general-analysis-subtitle"]')?.textContent?.trim(),
    ).toBe('N/A');
    expect(host.querySelector('[data-testid="index-value-cpi"]')?.textContent?.trim()).toBe(
      '0,0000',
    );
    expect(host.querySelector('[data-testid="other-value-cv"]')?.textContent?.trim()).toBe('0,00');
    expect(host.querySelector('[data-testid="activity-row"]')).toBeNull();
    expect(host.querySelector('[data-testid="donut-caption-planned"]')?.textContent).toContain(
      '0,0%',
    );
  });

  it('lista las actividades del store en el droplist', async () => {
    store.activitiesSignal.set([makeActivity({ id: 1 }), makeActivity({ id: 2 })]);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('nz-select')).not.toBeNull();
  });
});
