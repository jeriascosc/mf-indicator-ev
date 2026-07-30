import { ChangeDetectionStrategy, Component, OnInit, effect, inject } from '@angular/core';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import type { ActivityRequest } from '../../core/models/activity';
import { DashboardStore } from '../../core/services/dashboard-store';
import { ActivityFormModal } from './activity-form-modal/activity-form-modal';
import { ActivitySelector } from './activity-selector/activity-selector';
import { ActivityTable } from './activity-table/activity-table';
import { GeneralAnalysisAlert } from './general-analysis-alert/general-analysis-alert';
import { OtherIndicators } from './other-indicators/other-indicators';
import { PerformanceIndexCards } from './performance-index-cards/performance-index-cards';
import { PlannedVsExecutedChart } from './planned-vs-executed-chart/planned-vs-executed-chart';
import { ProgressDonuts } from './progress-donuts/progress-donuts';

/**
 * Contenedor del dashboard EVM.
 *
 * Es el unico componente que habla con el store; los bloques hijos son presentacionales. Cualquier
 * cambio de actividad -- seleccion, creacion, edicion o borrado -- pasa por el store y por lo tanto
 * refresca la pantalla completa de una sola vez.
 */
@Component({
  selector: 'app-dashboard',
  imports: [
    NzGridModule,
    NzSpinModule,
    GeneralAnalysisAlert,
    ActivitySelector,
    PerformanceIndexCards,
    PlannedVsExecutedChart,
    ProgressDonuts,
    OtherIndicators,
    ActivityTable,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private readonly store = inject(DashboardStore);
  private readonly modal = inject(NzModalService);
  private readonly message = inject(NzMessageService);

  readonly activities = this.store.activities;
  readonly selectedId = this.store.selectedId;
  readonly selected = this.store.selected;
  readonly indicator = this.store.indicator;
  readonly interpretation = this.store.interpretation;
  readonly loading = this.store.loading;

  constructor() {
    // Los fallos del API se notifican una sola vez, en el contenedor, en lugar de en cada bloque.
    effect(() => {
      const error = this.store.error();
      if (error) {
        this.message.error(error);
      }
    });
  }

  ngOnInit(): void {
    // Sin argumento el store selecciona la ultima actividad creada.
    void this.store.load();
  }

  onActivitySelected(id: number): void {
    void this.store.select(id);
  }

  /** Abre el modal de creacion. Cancelar cierra sin efectos; guardar crea y selecciona la nueva. */
  openCreateModal(): void {
    const modalRef = this.modal.create<ActivityFormModal, ActivityRequest | undefined>({
      nzTitle: 'Nueva actividad',
      nzContent: ActivityFormModal,
      nzFooter: null,
      nzMaskClosable: false,
    });

    modalRef.afterClose.subscribe((request) => {
      if (request) {
        void this.createActivity(request);
      }
    });
  }

  async onUpdateRequested(request: ActivityRequest): Promise<void> {
    const id = this.selectedId();
    if (id === null) {
      return;
    }
    if (await this.store.update(id, request)) {
      this.message.success('Actividad actualizada.');
    }
  }

  async onDeleteRequested(id: number): Promise<void> {
    if (await this.store.remove(id)) {
      this.message.success('Actividad eliminada.');
    }
  }

  private async createActivity(request: ActivityRequest): Promise<void> {
    if (await this.store.create(request)) {
      this.message.success('Actividad creada.');
    }
  }
}
