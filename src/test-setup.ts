/**
 * Polyfills que NG-ZORRO y Apache ECharts necesitan bajo jsdom.
 *
 * jsdom no implementa `ResizeObserver` (usado por nz-table/nz-select y por el auto-resize de
 * ECharts) ni `matchMedia` (usado por nz-grid para los breakpoints responsive). Sin estos stubs
 * los componentes lanzan `ReferenceError` al instanciarse en los specs.
 */

class ResizeObserverStub implements ResizeObserver {
  observe(): void {
    /* no-op */
  }
  unobserve(): void {
    /* no-op */
  }
  disconnect(): void {
    /* no-op */
  }
}

if (!('ResizeObserver' in globalThis)) {
  (globalThis as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
    ResizeObserverStub as unknown as typeof ResizeObserver;
}

if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
