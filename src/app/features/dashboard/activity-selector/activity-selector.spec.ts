import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { makeActivity } from '../../../testing/fixtures';
import { dashboardTestProviders } from '../../../testing/test-providers';
import { ActivitySelector } from './activity-selector';

describe('ActivitySelector', () => {
  let fixture: ComponentFixture<ActivitySelector>;
  let component: ActivitySelector;

  const activities = [
    makeActivity({ id: 1, name: 'Cimentacion' }),
    makeActivity({ id: 2, name: 'Estructura metalica' }),
  ];

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ActivitySelector],
      providers: [dashboardTestProviders()],
    });
    fixture = TestBed.createComponent(ActivitySelector);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('muestra el label "Actividad Seleccionada"', () => {
    const label = fixture.nativeElement.querySelector('.activity-selector__label');
    expect(label?.textContent?.trim()).toBe('Actividad Seleccionada');
  });

  it('convierte las actividades en opciones del droplist', async () => {
    fixture.componentRef.setInput('activities', activities);
    await fixture.whenStable();

    expect(component.options()).toEqual([
      { label: 'Cimentacion', value: 1 },
      { label: 'Estructura metalica', value: 2 },
    ]);
    expect(component.isEmpty()).toBe(false);
  });

  it('queda deshabilitado cuando no hay actividades', async () => {
    fixture.componentRef.setInput('activities', []);
    await fixture.whenStable();

    expect(component.isEmpty()).toBe(true);
    expect(fixture.nativeElement.querySelector('nz-select.ant-select-disabled')).not.toBeNull();
  });

  it('queda deshabilitado mientras el dashboard esta cargando', async () => {
    fixture.componentRef.setInput('activities', activities);
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('nz-select.ant-select-disabled')).not.toBeNull();
  });

  it('emite el id elegido', () => {
    const emitted: number[] = [];
    component.activitySelected.subscribe((id) => emitted.push(id));

    component.onChange(2);

    expect(emitted).toEqual([2]);
  });

  it('no emite nada cuando el droplist se limpia', () => {
    const emitted: number[] = [];
    component.activitySelected.subscribe((id) => emitted.push(id));

    component.onChange(null);

    expect(emitted).toEqual([]);
  });
});
