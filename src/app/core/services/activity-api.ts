import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Activity, ActivityRequest } from '../models/activity';
import type { Indicator } from '../models/indicator';
import type { Interpretation } from '../models/interpretation';

/**
 * Unico punto de la aplicacion que conoce las rutas de ms-indicator-ev.
 *
 * La base es relativa porque el dev-server hace proxy de `/api` hacia `http://localhost:8080`
 * (ver `proxy.conf.json`), de modo que no hace falta configurar CORS en el backend.
 */
export const ACTIVITIES_URL = '/api/v1/activities';

/** Valor de la cabecera `X-User` que el backend registra en los campos de auditoria. */
export const API_USER = 'mf-indicator-ev';

@Injectable({ providedIn: 'root' })
export class ActivityApi {
  private readonly http = inject(HttpClient);

  private readonly writeHeaders = new HttpHeaders({ 'X-User': API_USER });

  findAll(): Observable<Activity[]> {
    return this.http.get<Activity[]>(ACTIVITIES_URL);
  }

  findById(id: number): Observable<Activity> {
    return this.http.get<Activity>(`${ACTIVITIES_URL}/${id}`);
  }

  create(request: ActivityRequest): Observable<Activity> {
    return this.http.post<Activity>(ACTIVITIES_URL, request, { headers: this.writeHeaders });
  }

  update(id: number, request: ActivityRequest): Observable<Activity> {
    return this.http.put<Activity>(`${ACTIVITIES_URL}/${id}`, request, {
      headers: this.writeHeaders,
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${ACTIVITIES_URL}/${id}`);
  }

  indicators(id: number): Observable<Indicator> {
    return this.http.get<Indicator>(`${ACTIVITIES_URL}/${id}/indicators`);
  }

  interpretation(id: number): Observable<Interpretation> {
    return this.http.get<Interpretation>(`${ACTIVITIES_URL}/${id}/interpretation`);
  }
}
