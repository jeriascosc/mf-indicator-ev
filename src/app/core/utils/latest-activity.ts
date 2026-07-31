import type { Activity } from '../models/activity';

/**
 * Compara dos actividades por antiguedad de creacion.
 *
 * El endpoint `GET /activities` no admite ordenamiento, asi que la "ultima actividad creada" se
 * resuelve en el cliente. Se usa `createDate` y, cuando falta o empata (los seis registros de
 * `data.sql` se insertan con el mismo `CURRENT_TIMESTAMP`), se desempata por el id autoincremental.
 */
function isNewer(candidate: Activity, current: Activity): boolean {
  const candidateTime = candidate.createDate ? Date.parse(candidate.createDate) : Number.NaN;
  const currentTime = current.createDate ? Date.parse(current.createDate) : Number.NaN;

  if (!Number.isNaN(candidateTime) && !Number.isNaN(currentTime) && candidateTime !== currentTime) {
    return candidateTime > currentTime;
  }
  return candidate.id > current.id;
}

/** Ultima actividad creada de la lista, o `null` si la lista esta vacia. */
export function latestActivity(activities: readonly Activity[]): Activity | null {
  if (activities.length === 0) {
    return null;
  }
  return activities.reduce((latest, current) => (isNewer(current, latest) ? current : latest));
}
