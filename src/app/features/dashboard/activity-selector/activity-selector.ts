import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';

import type { Activity } from '../../../core/models/activity';

/**
 * Droplist "Actividad Seleccionada" con busqueda.
 *
 * Es puramente presentacional: recibe la lista y el id activo, y emite el id elegido. El
 * contenedor decide que hacer, de modo que un cambio aqui refresca toda la pantalla.
 */
@Component({
  selector: 'app-activity-selector',
  imports: [FormsModule, NzSelectModule],
  templateUrl: './activity-selector.html',
  styleUrl: './activity-selector.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivitySelector {
  readonly activities = input<readonly Activity[]>([]);
  readonly selectedId = input<number | null>(null);
  readonly disabled = input(false);

  readonly activitySelected = output<number>();

  readonly options = computed(() =>
    this.activities().map((activity) => ({ label: activity.name, value: activity.id })),
  );

  readonly isEmpty = computed(() => this.activities().length === 0);

  onChange(id: number | null): void {
    if (id !== null && id !== undefined) {
      this.activitySelected.emit(id);
    }
  }
}
