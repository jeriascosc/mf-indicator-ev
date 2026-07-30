import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalRef } from 'ng-zorro-antd/modal';

import type { ActivityRequest } from '../../../core/models/activity';

/**
 * Contenido del modal para crear una actividad.
 *
 * Se cierra devolviendo el `ActivityRequest` al pulsar Guardar, o `undefined` al cancelar; asi el
 * contenedor distingue ambos casos sin necesidad de flags adicionales. Las validaciones replican
 * las del backend (nombre obligatorio de hasta 150 caracteres, montos no negativos y porcentajes
 * como fraccion entre 0.0 y 1.0).
 */
@Component({
  selector: 'app-activity-form-modal',
  imports: [ReactiveFormsModule, NzFormModule, NzInputModule, NzInputNumberModule, NzButtonModule],
  templateUrl: './activity-form-modal.html',
  styleUrl: './activity-form-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityFormModal {
  private readonly modalRef = inject(NzModalRef<ActivityFormModal, ActivityRequest | undefined>);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    totalPlannedBudget: [0, [Validators.required, Validators.min(0)]],
    porcentPlanned: [0, [Validators.required, Validators.min(0), Validators.max(1)]],
    porcentComplete: [0, [Validators.required, Validators.min(0), Validators.max(1)]],
    actualCost: [0, [Validators.required, Validators.min(0)]],
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.modalRef.close(this.form.getRawValue() satisfies ActivityRequest);
  }

  cancel(): void {
    // Cancelar no hace nada mas que cerrar: se devuelve undefined y el contenedor lo ignora.
    this.modalRef.close(undefined);
  }
}
