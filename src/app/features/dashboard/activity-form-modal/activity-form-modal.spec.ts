import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ActivityRequest } from '../../../core/models/activity';
import { dashboardTestProviders } from '../../../testing/test-providers';
import { ActivityFormModal } from './activity-form-modal';

describe('ActivityFormModal', () => {
  let fixture: ComponentFixture<ActivityFormModal>;
  let component: ActivityFormModal;
  let close: ReturnType<typeof vi.fn>;

  const validValues: ActivityRequest = {
    name: 'Nueva actividad',
    totalPlannedBudget: 20000,
    porcentPlanned: 0.4,
    porcentComplete: 0.35,
    actualCost: 7000,
  };

  beforeEach(async () => {
    close = vi.fn();
    TestBed.configureTestingModule({
      imports: [ActivityFormModal],
      providers: [dashboardTestProviders(), { provide: NzModalRef, useValue: { close } }],
    });
    fixture = TestBed.createComponent(ActivityFormModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('arranca con el formulario en cero y el nombre vacio', () => {
    expect(component.form.getRawValue()).toEqual({
      name: '',
      totalPlannedBudget: 0,
      porcentPlanned: 0,
      porcentComplete: 0,
      actualCost: 0,
    });
    expect(component.form.invalid).toBe(true);
  });

  it('guarda devolviendo el ActivityRequest al cerrar el modal', () => {
    component.form.setValue(validValues);

    component.save();

    expect(close).toHaveBeenCalledWith(validValues);
  });

  it('no guarda ni cierra cuando el formulario es invalido', () => {
    component.save();

    expect(close).not.toHaveBeenCalled();
    expect(component.form.controls.name.touched).toBe(true);
  });

  it('rechaza un porcentaje mayor que 1', () => {
    component.form.setValue({ ...validValues, porcentPlanned: 1.5 });

    component.save();

    expect(component.form.controls.porcentPlanned.invalid).toBe(true);
    expect(close).not.toHaveBeenCalled();
  });

  it('rechaza montos negativos', () => {
    component.form.setValue({ ...validValues, actualCost: -1 });

    component.save();

    expect(component.form.controls.actualCost.invalid).toBe(true);
    expect(close).not.toHaveBeenCalled();
  });

  it('rechaza un nombre de mas de 150 caracteres', () => {
    component.form.setValue({ ...validValues, name: 'x'.repeat(151) });

    component.save();

    expect(component.form.controls.name.invalid).toBe(true);
    expect(close).not.toHaveBeenCalled();
  });

  it('cancelar cierra sin devolver datos', () => {
    component.form.setValue(validValues);

    component.cancel();

    expect(close).toHaveBeenCalledWith(undefined);
  });

  it('los botones del pie disparan guardar y cancelar', () => {
    component.form.setValue(validValues);

    (
      fixture.nativeElement.querySelector('[data-testid="modal-save"]') as HTMLButtonElement
    ).click();
    expect(close).toHaveBeenCalledWith(validValues);

    (
      fixture.nativeElement.querySelector('[data-testid="modal-cancel"]') as HTMLButtonElement
    ).click();
    expect(close).toHaveBeenCalledWith(undefined);
  });
});
