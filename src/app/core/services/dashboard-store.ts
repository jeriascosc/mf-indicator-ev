import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import type { Activity, ActivityRequest } from '../models/activity';
import type { Indicator } from '../models/indicator';
import type { Interpretation } from '../models/interpretation';
import { latestActivity } from '../utils/latest-activity';
import { ActivityApi } from './activity-api';

/**
 * Estado unico del dashboard.
 *
 * Todos los bloques de la pantalla leen de estas signals, de forma que un cambio de actividad
 * seleccionada -- venga del droplist, de una creacion, de una edicion o de un borrado -- refresca
 * la pantalla completa sin coordinacion adicional entre componentes.
 */
@Injectable({ providedIn: 'root' })
export class DashboardStore {
  private readonly api = inject(ActivityApi);

  private readonly activitiesSignal = signal<readonly Activity[]>([]);
  private readonly selectedIdSignal = signal<number | null>(null);
  private readonly indicatorSignal = signal<Indicator | null>(null);
  private readonly interpretationSignal = signal<Interpretation | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly activities = this.activitiesSignal.asReadonly();
  readonly selectedId = this.selectedIdSignal.asReadonly();
  readonly indicator = this.indicatorSignal.asReadonly();
  readonly interpretation = this.interpretationSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  /** Actividad seleccionada completa, o `null` cuando la base de datos esta vacia. */
  readonly selected = computed<Activity | null>(() => {
    const id = this.selectedIdSignal();
    return this.activitiesSignal().find((activity) => activity.id === id) ?? null;
  });

  readonly hasSelection = computed(() => this.selected() !== null);

  /**
   * Carga la lista de actividades y resuelve cual queda seleccionada.
   *
   * @param preferredId actividad que debe quedar seleccionada si sigue existiendo (por ejemplo la
   * recien creada o la que se acaba de editar). Sin este parametro se conserva la seleccion actual
   * y, si ya no existe, se cae a la ultima actividad creada.
   */
  async load(preferredId?: number | null): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      const activities = await firstValueFrom(this.api.findAll());
      this.activitiesSignal.set(activities);

      const target = this.resolveTarget(activities, preferredId);
      if (target === null) {
        this.clearSelection();
        return;
      }
      await this.loadDetail(target);
    } catch (error: unknown) {
      this.errorSignal.set(this.messageOf(error, 'No fue posible cargar las actividades.'));
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /** Cambia la actividad seleccionada y recarga sus indicadores e interpretacion. */
  async select(id: number): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      await this.loadDetail(id);
    } catch (error: unknown) {
      this.errorSignal.set(this.messageOf(error, 'No fue posible cargar la actividad.'));
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /** Crea una actividad y la deja como "Actividad Seleccionada". */
  async create(request: ActivityRequest): Promise<boolean> {
    return this.mutate(async () => {
      const created = await firstValueFrom(this.api.create(request));
      return created.id;
    }, 'No fue posible crear la actividad.');
  }

  /** Persiste los valores editados en la datatable manteniendo la misma actividad seleccionada. */
  async update(id: number, request: ActivityRequest): Promise<boolean> {
    return this.mutate(async () => {
      await firstValueFrom(this.api.update(id, request));
      return id;
    }, 'No fue posible actualizar la actividad.');
  }

  /**
   * Elimina la actividad y recarga la pantalla con la ultima actividad creada que quede.
   *
   * Si la tabla queda vacia la seleccion se limpia y la pantalla muestra `N/A` y ceros.
   */
  async remove(id: number): Promise<boolean> {
    return this.mutate(async () => {
      await firstValueFrom(this.api.delete(id));
      return null;
    }, 'No fue posible eliminar la actividad.');
  }

  /** Ejecuta una escritura y recarga el estado completo con la actividad que corresponda. */
  private async mutate(
    action: () => Promise<number | null>,
    errorMessage: string,
  ): Promise<boolean> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    let preferredId: number | null;
    try {
      preferredId = await action();
    } catch (error: unknown) {
      this.errorSignal.set(this.messageOf(error, errorMessage));
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
    // `load` vuelve a levantar su propio flag de carga y refresca la pantalla completa.
    await this.load(preferredId);
    return this.errorSignal() === null;
  }

  private async loadDetail(id: number): Promise<void> {
    this.selectedIdSignal.set(id);
    const [indicator, interpretation] = await Promise.all([
      firstValueFrom(this.api.indicators(id)),
      firstValueFrom(this.api.interpretation(id)),
    ]);
    this.indicatorSignal.set(indicator);
    this.interpretationSignal.set(interpretation);
  }

  private resolveTarget(
    activities: readonly Activity[],
    preferredId?: number | null,
  ): number | null {
    const exists = (id: number | null | undefined): boolean =>
      id !== null && id !== undefined && activities.some((activity) => activity.id === id);

    if (exists(preferredId)) {
      return preferredId as number;
    }
    if (preferredId === undefined && exists(this.selectedIdSignal())) {
      return this.selectedIdSignal();
    }
    return latestActivity(activities)?.id ?? null;
  }

  private clearSelection(): void {
    this.selectedIdSignal.set(null);
    this.indicatorSignal.set(null);
    this.interpretationSignal.set(null);
  }

  private messageOf(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) {
      return `${fallback} (${error.message})`;
    }
    return fallback;
  }
}
