import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTableModule } from 'ng-zorro-antd/table';

import type { Activity, ActivityRequest } from '../../../core/models/activity';
import { NOT_AVAILABLE } from '../../../core/utils/format';

/** Copia editable de la actividad seleccionada. */
export type ActivityDraft = ActivityRequest;

/** Campos numericos editables de la tabla. */
export type EditableField = Exclude<keyof ActivityDraft, 'name'>;

const EMPTY_DRAFT: ActivityDraft = {
  name: '',
  totalPlannedBudget: 0,
  porcentPlanned: 0,
  porcentComplete: 0,
  actualCost: 0,
};

/**
 * Datatable de la actividad seleccionada con sus tres acciones.
 *
 * La edicion trabaja sobre una copia local (`draft`) que se reinicia cada vez que cambia la
 * actividad de entrada, de forma que cambiar de actividad en el droplist descarta ediciones a
 * medias en lugar de arrastrarlas al registro nuevo. `name` se muestra como texto porque el
 * requisito pide que sea el unico campo no editable.
 */
@Component({
  selector: 'app-activity-table',
  imports: [
    FormsModule,
    NzTableModule,
    NzInputNumberModule,
    NzButtonModule,
    NzIconModule,
    NzPopconfirmModule,
  ],
  templateUrl: './activity-table.html',
  styleUrl: './activity-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityTable {
  readonly activity = input<Activity | null>(null);
  readonly busy = input(false);

  readonly addRequested = output<void>();
  readonly updateRequested = output<ActivityRequest>();
  readonly deleteRequested = output<number>();

  readonly draft = linkedSignal<Activity | null, ActivityDraft>({
    source: this.activity,
    computation: (activity) =>
      activity
        ? {
            name: activity.name,
            totalPlannedBudget: activity.totalPlannedBudget,
            porcentPlanned: activity.porcentPlanned,
            porcentComplete: activity.porcentComplete,
            actualCost: activity.actualCost,
          }
        : { ...EMPTY_DRAFT },
  });

  readonly hasActivity = computed(() => this.activity() !== null);

  readonly displayName = computed(() => this.activity()?.name ?? NOT_AVAILABLE);

  /** `nzData` de la tabla: una sola fila, o ninguna cuando no hay actividad seleccionada. */
  readonly rows = computed<readonly ActivityDraft[]>(() =>
    this.hasActivity() ? [this.draft()] : [],
  );

  patch(field: EditableField, value: number | null): void {
    this.draft.update((draft) => ({ ...draft, [field]: value ?? 0 }));
  }

  onAdd(): void {
    this.addRequested.emit();
  }

  onRefresh(): void {
    if (!this.hasActivity()) {
      return;
    }
    this.updateRequested.emit({ ...this.draft() });
  }

  onDelete(): void {
    const activity = this.activity();
    if (activity) {
      this.deleteRequested.emit(activity.id);
    }
  }
}
