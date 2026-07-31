# mf-indicator-ev

Aplicativo WEB en Angular para gestionar visualmente y analizar a travéz de gráficos el comportamiento de un proyecto mediante la metodología Earned Value Management.

Consume el microservicio [`ms-indicator-ev`](../ms-indicator-ev) (Spring Boot, puerto 8080).

## Stack

| Pieza | Versión |
|---|---|
| Angular | 22.1.0 (zoneless, standalone, signals) |
| NG-ZORRO | 22.0.0 (locale `es_ES`) |
| Apache ECharts | 6.1.0 vía `ngx-echarts` 22.0.0 |
| Runner de pruebas | Vitest 4 (jsdom), umbral de cobertura 82% |
| Node | ≥ 24.15.0 (probado con 24.18.0) |

## Puesta en marcha

```bash
# 1. Backend
cd ../ms-indicator-ev && ./mvnw spring-boot:run     # requiere un JDK 21+ en JAVA_HOME

# 2. Frontend
npm install
npm start                                            # http://localhost:4200
```

El dev-server hace proxy de `/api` hacia `http://localhost:8080` (ver `proxy.conf.json`), por lo que
**no hace falta configurar CORS en el backend**. El código llama siempre a rutas relativas
(`/api/v1/activities`).

## Pruebas

```bash
npm test          # Vitest + cobertura; falla si alguna métrica baja del 82%
```

El umbral está declarado en `angular.json` (`test.options.coverageThresholds`). El reporte HTML queda
en `coverage/`.

Los gráficos se prueban sustituyendo `NgxEchartsDirective` por `src/app/testing/echarts-stub.ts`,
porque ECharts necesita un canvas real que jsdom no provee; la `EChartsOption` generada se verifica
directamente sobre el `computed()` del componente.

## Estructura

```
src/app/
  core/
    models/          Espejos de los DTOs del backend (Activity, Indicator, Interpretation)
    services/
      activity-api.ts      Único punto que conoce las 7 rutas del microservicio
      dashboard-store.ts   Estado único en signals: toda la pantalla lee de aquí
    utils/
      analysis-alert.ts    cpiVsSpiAnalysis -> tipo de nz-alert + icono
      indicator-color.ts   Semáforo de color de CPI y SPI
      format.ts            N/A vs cero, y fracción -> porcentaje
      latest-activity.ts   Resolución de la "última actividad creada"
  features/dashboard/       Contenedor + 8 bloques presentacionales
  testing/                  Fixtures, stub de ECharts y providers de test
```

`Dashboard` es el único componente que habla con el store; los bloques reciben `input()` y emiten
`output()`. Por eso cualquier cambio de actividad —selección, creación, edición o borrado— refresca
la pantalla completa sin coordinación entre componentes.

## Reglas de negocio implementadas

**Tipo de alerta del "Análisis General"** (`GET /activities/{id}/interpretation`):

| `cpiVsSpiAnalysis` | Alerta |
|---|---|
| Proyecto ideal | `info` |
| Proyecto crítico | `error` |
| Proyecto con mayor gasto y retrasado | `warning` |
| Rápido avance a mayor costo | `success` |
| Proyecto conforme a lo planeado | `info` |
| No calculable | `warning` |

**Color de los índices**: CPI `=1` azul, `>1` verde, `<1` rojo. SPI `=1` azul, `>1` verde, `<1`
naranja. Un índice `null` (divisor cero en el backend) se pinta gris y se muestra `N/A`.

**Estado vacío**: sin actividades en base de datos los textos quedan en `N/A` y todos los valores
numéricos en cero. Con actividad seleccionada, en cambio, un indicador `null` se muestra como `N/A`
para no confundir "no calculable" con un cero real.

**Porcentajes**: se muestran y editan como fracción `0.0 - 1.0`, igual que los valida el backend
(`@DecimalMin 0.0` / `@DecimalMax 1.0`).
