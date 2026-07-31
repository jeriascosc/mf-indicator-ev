import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxEchartsDirective } from 'ngx-echarts';
import { beforeEach, describe, expect, it } from 'vitest';

import { makeActivity, makeIndicator } from '../../../testing/fixtures';
import { EchartsStub } from '../../../testing/echarts-stub';
import { dashboardTestProviders } from '../../../testing/test-providers';
import { AC_COLOR, EV_COLOR, PV_COLOR, PlannedVsExecutedChart } from './planned-vs-executed-chart';

/** Serie del grafico, con el minimo tipado que necesitan las aserciones. */
interface BarSeries {
  name: string;
  type: string;
  itemStyle: { color: string };
  data: number[];
}

describe('PlannedVsExecutedChart', () => {
  let fixture: ComponentFixture<PlannedVsExecutedChart>;
  let component: PlannedVsExecutedChart;

  const series = (): BarSeries[] => component.chartOption()['series'] as BarSeries[];

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [PlannedVsExecutedChart],
      providers: [dashboardTestProviders()],
    });
    // ECharts necesita un canvas real, que jsdom no ofrece: se sustituye la directiva por un stub.
    TestBed.overrideComponent(PlannedVsExecutedChart, {
      remove: { imports: [NgxEchartsDirective] },
      add: { imports: [EchartsStub] },
    });
    fixture = TestBed.createComponent(PlannedVsExecutedChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('muestra el label con el icono rise', () => {
    expect(
      fixture.nativeElement.querySelector('[data-testid="planned-vs-executed-label"]')?.textContent,
    ).toBe('Comportamiento Planeado vs Ejecutado');
    expect(fixture.nativeElement.querySelector('[data-testid="rise-icon"]')).not.toBeNull();
  });

  it('grafica PV en azul, EV en violeta y AC en turquesa', async () => {
    fixture.componentRef.setInput('indicator', makeIndicator({ pv: 5000, ev: 6000 }));
    fixture.componentRef.setInput('activity', makeActivity({ actualCost: 8000 }));
    await fixture.whenStable();

    const [pv, ev, ac] = series();
    expect(pv.name).toBe('PV');
    expect(pv.type).toBe('bar');
    expect(pv.itemStyle.color).toBe(PV_COLOR);
    expect(pv.data).toEqual([5000]);

    expect(ev.name).toBe('EV');
    expect(ev.itemStyle.color).toBe(EV_COLOR);
    expect(ev.data).toEqual([6000]);

    expect(ac.name).toBe('AC');
    expect(ac.type).toBe('bar');
    expect(ac.itemStyle.color).toBe(AC_COLOR);
    expect(ac.data).toEqual([8000]);
  });

  it('toma el AC de la actividad, no del indicador', async () => {
    // `IndicatorResponse` no trae actualCost: es un dato de entrada, no un indicador calculado.
    fixture.componentRef.setInput('indicator', makeIndicator());
    await fixture.whenStable();
    expect(component.ac()).toBe(0);

    fixture.componentRef.setInput('activity', makeActivity({ actualCost: 3200 }));
    await fixture.whenStable();
    expect(component.ac()).toBe(3200);
  });

  it('deja las barras en cero cuando no hay indicador ni actividad', () => {
    expect(component.pv()).toBe(0);
    expect(component.ev()).toBe(0);
    expect(component.ac()).toBe(0);
    expect(series()[0].data).toEqual([0]);
    expect(series()[1].data).toEqual([0]);
    expect(series()[2].data).toEqual([0]);
  });

  it('renderiza el contenedor del grafico con las opciones calculadas', async () => {
    fixture.componentRef.setInput('indicator', makeIndicator());
    await fixture.whenStable();

    const chart = fixture.nativeElement.querySelector('[data-testid="planned-vs-executed-chart"]');
    expect(chart).not.toBeNull();
    expect(component.chartOption()['legend']).toEqual({ data: ['PV', 'EV', 'AC'], bottom: 0 });
  });
});
