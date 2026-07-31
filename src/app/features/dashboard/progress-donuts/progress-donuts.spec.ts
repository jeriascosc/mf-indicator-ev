import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxEchartsDirective } from 'ngx-echarts';
import { beforeEach, describe, expect, it } from 'vitest';

import { makeActivity, makeIndicator } from '../../../testing/fixtures';
import { EchartsStub } from '../../../testing/echarts-stub';
import { dashboardTestProviders } from '../../../testing/test-providers';
import {
  COMPLETE_COLOR,
  PLANNED_COLOR,
  REMAINING_COLOR,
  type ProgressDonut,
  ProgressDonuts,
} from './progress-donuts';

/** Porcion del donut, con el minimo tipado que necesitan las aserciones. */
interface PieSlice {
  value: number;
  name: string;
  itemStyle: { color: string };
}

describe('ProgressDonuts', () => {
  let fixture: ComponentFixture<ProgressDonuts>;
  let component: ProgressDonuts;

  const slicesOf = (donut: ProgressDonut): PieSlice[] =>
    (donut.option['series'] as Array<{ data: PieSlice[] }>)[0].data;

  const titleText = (key: string): string =>
    fixture.nativeElement
      .querySelector(`[data-testid="donut-title-${key}"]`)
      ?.textContent?.trim() ?? '';

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ProgressDonuts],
      providers: [dashboardTestProviders()],
    });
    TestBed.overrideComponent(ProgressDonuts, {
      remove: { imports: [NgxEchartsDirective] },
      add: { imports: [EchartsStub] },
    });
    fixture = TestBed.createComponent(ProgressDonuts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('muestra los titulos de las dos graficas', async () => {
    fixture.componentRef.setInput('activity', makeActivity());
    await fixture.whenStable();

    expect(titleText('planned')).toBe('Avance porcentaje planeado');
    expect(titleText('complete')).toBe('Avance porcentaje ejecutado');
  });

  it('mide el avance planeado sobre el BAC en azul', async () => {
    fixture.componentRef.setInput('activity', makeActivity({ porcentPlanned: 0.5 }));
    fixture.componentRef.setInput('indicator', makeIndicator({ bac: 10000 }));
    await fixture.whenStable();

    const [planned] = component.donuts();
    const slices = slicesOf(planned);
    expect(planned.percentText).toBe('50,0%');
    expect(slices[0]).toMatchObject({ value: 5000, itemStyle: { color: PLANNED_COLOR } });
    expect(slices[1]).toMatchObject({ value: 5000, itemStyle: { color: REMAINING_COLOR } });
  });

  it('mide el avance ejecutado sobre el BAC en violeta', async () => {
    fixture.componentRef.setInput('activity', makeActivity({ porcentComplete: 0.6 }));
    fixture.componentRef.setInput('indicator', makeIndicator({ bac: 10000 }));
    await fixture.whenStable();

    const complete = component.donuts()[1];
    const slices = slicesOf(complete);
    expect(complete.percentText).toBe('60,0%');
    expect(slices[0]).toMatchObject({ value: 6000, itemStyle: { color: COMPLETE_COLOR } });
    expect(slices[1].value).toBe(4000);
  });

  it('usa el BAC de la actividad cuando todavia no hay indicadores', async () => {
    fixture.componentRef.setInput('activity', makeActivity({ totalPlannedBudget: 8000 }));
    await fixture.whenStable();

    expect(component.bac()).toBe(8000);
  });

  it('sin actividad deja los donuts en cero y el anillo completo en gris', () => {
    expect(component.bac()).toBe(0);
    const [planned, complete] = component.donuts();
    expect(planned.percentText).toBe('0,0%');
    expect(complete.percentText).toBe('0,0%');
    // El tramo pendiente ocupa todo el anillo: si valiera cero, ECharts lo repartiria al 50%.
    expect(slicesOf(planned)[0].value).toBe(0);
    expect(slicesOf(planned)[1].value).toBe(1);
    expect(slicesOf(complete)[1].value).toBe(1);
  });

  it('nunca deja un tramo pendiente negativo', async () => {
    fixture.componentRef.setInput('activity', makeActivity({ porcentPlanned: 1 }));
    fixture.componentRef.setInput('indicator', makeIndicator({ bac: 10000 }));
    await fixture.whenStable();

    expect(slicesOf(component.donuts()[0])[1].value).toBe(0);
  });

  it('renderiza un contenedor de grafico por donut', async () => {
    fixture.componentRef.setInput('activity', makeActivity());
    await fixture.whenStable();

    expect(
      fixture.nativeElement.querySelector('[data-testid="donut-chart-planned"]'),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-testid="donut-chart-complete"]'),
    ).not.toBeNull();
  });
});
