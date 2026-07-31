import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import type { ActivityRequest } from '../../../core/models/activity';
import { makeActivity } from '../../../testing/fixtures';
import { dashboardTestProviders } from '../../../testing/test-providers';
import { ActivityTable } from './activity-table';

describe('ActivityTable', () => {
  let fixture: ComponentFixture<ActivityTable>;
  let component: ActivityTable;

  const button = (testId: string): HTMLButtonElement =>
    fixture.nativeElement.querySelector(`[data-testid="${testId}"]`) as HTMLButtonElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ActivityTable],
      providers: [dashboardTestProviders()],
    });
    fixture = TestBed.createComponent(ActivityTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('muestra el titulo "Actividad Seleccionada"', () => {
    expect(
      fixture.nativeElement.querySelector('[data-testid="activity-table-label"]')?.textContent,
    ).toBe('Actividad Seleccionada');
  });

  it('muestra los cinco encabezados de la tabla', () => {
    const headers = Array.from(
      fixture.nativeElement.querySelectorAll('thead th') as NodeListOf<HTMLElement>,
    ).map((th) => th.textContent?.trim());

    expect(headers).toEqual(['Nombre', 'BAC', '% Planeado', '% Completado', 'AC']);
  });

  it('carga la actividad seleccionada en la fila editable', async () => {
    fixture.componentRef.setInput(
      'activity',
      makeActivity({ name: 'Cimentacion', totalPlannedBudget: 10000, actualCost: 5000 }),
    );
    await fixture.whenStable();

    expect(component.hasActivity()).toBe(true);
    expect(component.displayName()).toBe('Cimentacion');
    expect(component.draft()).toEqual({
      name: 'Cimentacion',
      totalPlannedBudget: 10000,
      porcentPlanned: 0.5,
      porcentComplete: 0.6,
      actualCost: 5000,
    });
    expect(
      fixture.nativeElement.querySelector('[data-testid="cell-name"]')?.textContent?.trim(),
    ).toBe('Cimentacion');
  });

  it('muestra el nombre como texto, no como input', async () => {
    fixture.componentRef.setInput('activity', makeActivity());
    await fixture.whenStable();

    const nameCell = fixture.nativeElement.querySelector('[data-testid="cell-name"]');
    expect(nameCell?.querySelector('input')).toBeNull();
  });

  it('sin actividad no dibuja filas y el nombre queda en N/A', () => {
    expect(component.hasActivity()).toBe(false);
    expect(component.rows()).toEqual([]);
    expect(component.displayName()).toBe('N/A');
    expect(component.draft()).toEqual({
      name: '',
      totalPlannedBudget: 0,
      porcentPlanned: 0,
      porcentComplete: 0,
      actualCost: 0,
    });
  });

  it('descarta la edicion a medias al cambiar de actividad', async () => {
    fixture.componentRef.setInput('activity', makeActivity({ id: 1, totalPlannedBudget: 10000 }));
    await fixture.whenStable();
    component.patch('totalPlannedBudget', 99999);
    expect(component.draft().totalPlannedBudget).toBe(99999);

    fixture.componentRef.setInput('activity', makeActivity({ id: 2, totalPlannedBudget: 20000 }));
    await fixture.whenStable();

    expect(component.draft().totalPlannedBudget).toBe(20000);
  });

  it('trata como cero el borrado de un campo numerico', async () => {
    fixture.componentRef.setInput('activity', makeActivity());
    await fixture.whenStable();

    component.patch('actualCost', null);

    expect(component.draft().actualCost).toBe(0);
  });

  it('emite la solicitud de agregar', () => {
    let emitted = 0;
    component.addRequested.subscribe(() => emitted++);

    button('btn-add').click();

    expect(emitted).toBe(1);
  });

  it('Refrescar emite los valores editados', async () => {
    fixture.componentRef.setInput('activity', makeActivity());
    await fixture.whenStable();
    const emitted: ActivityRequest[] = [];
    component.updateRequested.subscribe((request) => emitted.push(request));

    component.patch('porcentComplete', 0.75);
    component.patch('actualCost', 6200);
    button('btn-refresh').click();

    expect(emitted).toHaveLength(1);
    expect(emitted[0]).toEqual({
      name: 'Cimentacion',
      totalPlannedBudget: 10000,
      porcentPlanned: 0.5,
      porcentComplete: 0.75,
      actualCost: 6200,
    });
  });

  it('Refrescar no emite nada si no hay actividad seleccionada', () => {
    const emitted: ActivityRequest[] = [];
    component.updateRequested.subscribe((request) => emitted.push(request));

    component.onRefresh();

    expect(emitted).toEqual([]);
  });

  it('Eliminar emite el id de la actividad', async () => {
    fixture.componentRef.setInput('activity', makeActivity({ id: 7 }));
    await fixture.whenStable();
    const emitted: number[] = [];
    component.deleteRequested.subscribe((id) => emitted.push(id));

    component.onDelete();

    expect(emitted).toEqual([7]);
  });

  it('Eliminar no emite nada si no hay actividad seleccionada', () => {
    const emitted: number[] = [];
    component.deleteRequested.subscribe((id) => emitted.push(id));

    component.onDelete();

    expect(emitted).toEqual([]);
  });

  it('deshabilita Refrescar y Eliminar sin actividad, pero deja Agregar activo', () => {
    expect(button('btn-add').disabled).toBe(false);
    expect(button('btn-refresh').disabled).toBe(true);
    expect(button('btn-delete').disabled).toBe(true);
  });

  it('deshabilita los tres botones mientras el dashboard esta ocupado', async () => {
    fixture.componentRef.setInput('activity', makeActivity());
    fixture.componentRef.setInput('busy', true);
    await fixture.whenStable();

    expect(button('btn-add').disabled).toBe(true);
    expect(button('btn-refresh').disabled).toBe(true);
    expect(button('btn-delete').disabled).toBe(true);
  });
});
