import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import type { AlertType } from '../../../core/utils/analysis-alert';
import { makeInterpretation } from '../../../testing/fixtures';
import { dashboardTestProviders } from '../../../testing/test-providers';
import { GeneralAnalysisAlert } from './general-analysis-alert';

describe('GeneralAnalysisAlert', () => {
  let fixture: ComponentFixture<GeneralAnalysisAlert>;
  let component: GeneralAnalysisAlert;

  const text = (testId: string): string =>
    fixture.nativeElement.querySelector(`[data-testid="${testId}"]`)?.textContent?.trim() ?? '';

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [GeneralAnalysisAlert],
      providers: [dashboardTestProviders()],
    });
    fixture = TestBed.createComponent(GeneralAnalysisAlert);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('muestra el titulo fijo "Análisis General"', async () => {
    fixture.componentRef.setInput('interpretation', makeInterpretation());
    await fixture.whenStable();

    expect(text('general-analysis-title')).toBe('Análisis General');
  });

  it('muestra la interpretacion como subtitulo', async () => {
    fixture.componentRef.setInput(
      'interpretation',
      makeInterpretation({ cpiVsSpiAnalysis: 'Proyecto crítico' }),
    );
    await fixture.whenStable();

    expect(text('general-analysis-subtitle')).toBe('Proyecto crítico');
  });

  it('muestra el estado de CPI y SPI como detalle', async () => {
    fixture.componentRef.setInput(
      'interpretation',
      makeInterpretation({ cpiStatus: 'Eficiencia de Costo', spiStatus: 'Retrazado' }),
    );
    await fixture.whenStable();

    expect(text('general-analysis-detail')).toBe('CPI: Eficiencia de Costo · SPI: Retrazado');
  });

  const alertCases: ReadonlyArray<[string, AlertType, string]> = [
    ['Proyecto ideal', 'info', 'info-circle'],
    ['Proyecto crítico', 'error', 'close-circle'],
    ['Proyecto con mayor gasto y retrasado', 'warning', 'exclamation-circle'],
    ['Rápido avance a mayor costo', 'success', 'check-circle'],
    ['Proyecto conforme a lo planeado', 'info', 'info-circle'],
    ['No calculable', 'warning', 'exclamation-circle'],
  ];

  it.each(alertCases)(
    'para "%s" usa alert %s con icono %s',
    async (analysis, expectedType, expectedIcon) => {
      fixture.componentRef.setInput(
        'interpretation',
        makeInterpretation({ cpiVsSpiAnalysis: analysis }),
      );
      await fixture.whenStable();

      expect(component.alertType()).toBe(expectedType);
      expect(component.alertIcon()).toBe(expectedIcon);
      expect(
        fixture.nativeElement
          .querySelector('[data-testid="general-analysis-alert"]')
          ?.getAttribute('data-alert-type'),
      ).toBe(expectedType);
    },
  );

  it('sin interpretacion muestra N/A, alerta warning y oculta el detalle', async () => {
    fixture.componentRef.setInput('interpretation', null);
    await fixture.whenStable();

    expect(component.alertType()).toBe('warning');
    expect(text('general-analysis-subtitle')).toBe('N/A');
    expect(component.statusDetail()).toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-testid="general-analysis-detail"]'),
    ).toBeNull();
  });
});
