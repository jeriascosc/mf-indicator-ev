import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { App } from './app';

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    });
  });

  it('se crea', () => {
    expect(TestBed.createComponent(App).componentInstance).toBeTruthy();
  });

  it('muestra la cabecera con el nombre del microfrontend', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.app-header__title')?.textContent).toContain(
      'mf-indicator-ev',
    );
    expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
  });
});
