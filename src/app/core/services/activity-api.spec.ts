import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { makeActivity, makeIndicator, makeInterpretation } from '../../testing/fixtures';
import type { ActivityRequest } from '../models/activity';
import { ACTIVITIES_URL, API_USER, ActivityApi } from './activity-api';

describe('ActivityApi', () => {
  let api: ActivityApi;
  let http: HttpTestingController;

  const request: ActivityRequest = {
    name: 'Cimentacion',
    totalPlannedBudget: 10000,
    porcentPlanned: 0.5,
    porcentComplete: 0.6,
    actualCost: 5000,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ActivityApi],
    });
    api = TestBed.inject(ActivityApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('lista las actividades', () => {
    const expected = [makeActivity()];
    api.findAll().subscribe((activities) => expect(activities).toEqual(expected));

    const call = http.expectOne(ACTIVITIES_URL);
    expect(call.request.method).toBe('GET');
    call.flush(expected);
  });

  it('obtiene una actividad por id', () => {
    const expected = makeActivity({ id: 3 });
    api.findById(3).subscribe((activity) => expect(activity.id).toBe(3));

    const call = http.expectOne(`${ACTIVITIES_URL}/3`);
    expect(call.request.method).toBe('GET');
    call.flush(expected);
  });

  it('crea una actividad enviando la cabecera X-User', () => {
    api.create(request).subscribe();

    const call = http.expectOne(ACTIVITIES_URL);
    expect(call.request.method).toBe('POST');
    expect(call.request.body).toEqual(request);
    expect(call.request.headers.get('X-User')).toBe(API_USER);
    call.flush(makeActivity());
  });

  it('actualiza una actividad enviando la cabecera X-User', () => {
    api.update(7, request).subscribe();

    const call = http.expectOne(`${ACTIVITIES_URL}/7`);
    expect(call.request.method).toBe('PUT');
    expect(call.request.body).toEqual(request);
    expect(call.request.headers.get('X-User')).toBe(API_USER);
    call.flush(makeActivity({ id: 7 }));
  });

  it('elimina una actividad', () => {
    api.delete(4).subscribe();

    const call = http.expectOne(`${ACTIVITIES_URL}/4`);
    expect(call.request.method).toBe('DELETE');
    call.flush(null);
  });

  it('consulta los indicadores de una actividad', () => {
    api.indicators(1).subscribe((indicator) => expect(indicator.cpi).toBe(1.2));

    const call = http.expectOne(`${ACTIVITIES_URL}/1/indicators`);
    expect(call.request.method).toBe('GET');
    call.flush(makeIndicator());
  });

  it('consulta la interpretacion de una actividad', () => {
    api
      .interpretation(1)
      .subscribe((interpretation) =>
        expect(interpretation.cpiVsSpiAnalysis).toBe('Proyecto ideal'),
      );

    const call = http.expectOne(`${ACTIVITIES_URL}/1/interpretation`);
    expect(call.request.method).toBe('GET');
    call.flush(makeInterpretation());
  });
});
