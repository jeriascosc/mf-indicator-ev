import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeActivity, makeIndicator, makeInterpretation } from '../../testing/fixtures';
import type { Activity, ActivityRequest } from '../models/activity';
import { ActivityApi } from './activity-api';
import { DashboardStore } from './dashboard-store';

/**
 * Doble del API que guarda la lista en memoria, de modo que create/update/delete se comporten como
 * lo hace el backend real: la recarga posterior ve el efecto de la escritura.
 */
class FakeActivityApi {
  activities: Activity[] = [];
  nextId = 100;
  failOn: 'findAll' | 'indicators' | 'create' | 'update' | 'delete' | null = null;

  readonly createSpy = vi.fn<(request: ActivityRequest) => void>();
  readonly updateSpy = vi.fn<(id: number, request: ActivityRequest) => void>();
  readonly deleteSpy = vi.fn<(id: number) => void>();

  findAll(): Observable<Activity[]> {
    return this.guard('findAll', () => of([...this.activities]));
  }

  indicators(id: number) {
    return this.guard('indicators', () => of(makeIndicator({ activityId: id })));
  }

  interpretation(id: number) {
    return of(makeInterpretation({ activityId: id }));
  }

  create(request: ActivityRequest): Observable<Activity> {
    this.createSpy(request);
    return this.guard('create', () => {
      const created = makeActivity({
        ...request,
        id: this.nextId++,
        createDate: '2026-07-30T12:00:00',
      });
      this.activities = [...this.activities, created];
      return of(created);
    });
  }

  update(id: number, request: ActivityRequest): Observable<Activity> {
    this.updateSpy(id, request);
    return this.guard('update', () => {
      this.activities = this.activities.map((activity) =>
        activity.id === id ? { ...activity, ...request } : activity,
      );
      return of(this.activities.find((activity) => activity.id === id) as Activity);
    });
  }

  delete(id: number): Observable<void> {
    this.deleteSpy(id);
    return this.guard('delete', () => {
      this.activities = this.activities.filter((activity) => activity.id !== id);
      return of(undefined);
    });
  }

  private guard<T>(
    operation: FakeActivityApi['failOn'],
    action: () => Observable<T>,
  ): Observable<T> {
    if (this.failOn === operation) {
      return throwError(() => new Error('boom'));
    }
    return action();
  }
}

describe('DashboardStore', () => {
  let store: DashboardStore;
  let api: FakeActivityApi;

  const threeActivities = (): Activity[] => [
    makeActivity({ id: 1, name: 'Cimentacion', createDate: '2026-07-29T10:00:00' }),
    makeActivity({ id: 2, name: 'Estructura metalica', createDate: '2026-07-29T10:00:00' }),
    makeActivity({ id: 3, name: 'Urbanismo', createDate: '2026-07-29T10:00:00' }),
  ];

  beforeEach(() => {
    api = new FakeActivityApi();
    TestBed.configureTestingModule({
      providers: [DashboardStore, { provide: ActivityApi, useValue: api }],
    });
    store = TestBed.inject(DashboardStore);
  });

  describe('load', () => {
    it('selecciona automaticamente la ultima actividad creada', async () => {
      api.activities = threeActivities();

      await store.load();

      expect(store.selectedId()).toBe(3);
      expect(store.selected()?.name).toBe('Urbanismo');
      expect(store.indicator()?.activityId).toBe(3);
      expect(store.interpretation()?.activityId).toBe(3);
      expect(store.hasSelection()).toBe(true);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('deja la pantalla vacia cuando no hay actividades', async () => {
      api.activities = [];

      await store.load();

      expect(store.selectedId()).toBeNull();
      expect(store.selected()).toBeNull();
      expect(store.indicator()).toBeNull();
      expect(store.interpretation()).toBeNull();
      expect(store.hasSelection()).toBe(false);
    });

    it('conserva la seleccion actual al recargar sin preferencia', async () => {
      api.activities = threeActivities();
      await store.load();
      await store.select(1);

      await store.load();

      expect(store.selectedId()).toBe(1);
    });

    it('cae a la ultima creada si la seleccion actual ya no existe', async () => {
      api.activities = threeActivities();
      await store.load();
      await store.select(1);

      api.activities = api.activities.filter((activity) => activity.id !== 1);
      await store.load();

      expect(store.selectedId()).toBe(3);
    });

    it('respeta el id preferido cuando existe', async () => {
      api.activities = threeActivities();

      await store.load(2);

      expect(store.selectedId()).toBe(2);
    });

    it('registra el error cuando falla el listado', async () => {
      api.failOn = 'findAll';

      await store.load();

      expect(store.error()).toContain('No fue posible cargar las actividades.');
      expect(store.loading()).toBe(false);
    });
  });

  describe('select', () => {
    it('cambia la actividad y recarga sus indicadores e interpretacion', async () => {
      api.activities = threeActivities();
      await store.load();

      await store.select(2);

      expect(store.selectedId()).toBe(2);
      expect(store.selected()?.name).toBe('Estructura metalica');
      expect(store.indicator()?.activityId).toBe(2);
      expect(store.interpretation()?.activityId).toBe(2);
    });

    it('registra el error cuando falla la consulta de indicadores', async () => {
      api.activities = threeActivities();
      await store.load();
      api.failOn = 'indicators';

      await store.select(1);

      expect(store.error()).toContain('No fue posible cargar la actividad.');
    });
  });

  describe('create', () => {
    const request: ActivityRequest = {
      name: 'Nueva actividad',
      totalPlannedBudget: 20000,
      porcentPlanned: 0.4,
      porcentComplete: 0.3,
      actualCost: 7000,
    };

    it('crea la actividad y la deja seleccionada', async () => {
      api.activities = threeActivities();
      await store.load();

      const ok = await store.create(request);

      expect(ok).toBe(true);
      expect(api.createSpy).toHaveBeenCalledWith(request);
      expect(store.selected()?.name).toBe('Nueva actividad');
      expect(store.selectedId()).toBe(100);
      expect(store.activities()).toHaveLength(4);
    });

    it('devuelve false y registra el error cuando la creacion falla', async () => {
      api.failOn = 'create';

      const ok = await store.create(request);

      expect(ok).toBe(false);
      expect(store.error()).toContain('No fue posible crear la actividad.');
    });
  });

  describe('update', () => {
    it('persiste los valores editados manteniendo la seleccion', async () => {
      api.activities = threeActivities();
      await store.load();
      await store.select(1);

      const edited: ActivityRequest = {
        name: 'Cimentacion',
        totalPlannedBudget: 15000,
        porcentPlanned: 0.7,
        porcentComplete: 0.65,
        actualCost: 9000,
      };
      const ok = await store.update(1, edited);

      expect(ok).toBe(true);
      expect(api.updateSpy).toHaveBeenCalledWith(1, edited);
      expect(store.selectedId()).toBe(1);
      expect(store.selected()?.totalPlannedBudget).toBe(15000);
    });

    it('devuelve false y registra el error cuando la actualizacion falla', async () => {
      api.activities = threeActivities();
      await store.load();
      api.failOn = 'update';

      const ok = await store.update(1, { ...threeActivities()[0] });

      expect(ok).toBe(false);
      expect(store.error()).toContain('No fue posible actualizar la actividad.');
    });
  });

  describe('remove', () => {
    it('elimina y recae en la ultima actividad creada restante', async () => {
      api.activities = threeActivities();
      await store.load();

      const ok = await store.remove(3);

      expect(ok).toBe(true);
      expect(api.deleteSpy).toHaveBeenCalledWith(3);
      expect(store.selectedId()).toBe(2);
      expect(store.activities()).toHaveLength(2);
    });

    it('vacia la pantalla al borrar la ultima actividad existente', async () => {
      api.activities = [makeActivity({ id: 5 })];
      await store.load();

      await store.remove(5);

      expect(store.selectedId()).toBeNull();
      expect(store.selected()).toBeNull();
      expect(store.indicator()).toBeNull();
      expect(store.interpretation()).toBeNull();
      expect(store.activities()).toHaveLength(0);
    });

    it('devuelve false y registra el error cuando el borrado falla', async () => {
      api.activities = threeActivities();
      await store.load();
      api.failOn = 'delete';

      const ok = await store.remove(1);

      expect(ok).toBe(false);
      expect(store.error()).toContain('No fue posible eliminar la actividad.');
    });
  });
});
