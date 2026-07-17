import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTourKit } from '@mfontecchio/ng-tourkit';
import { PlaygroundLayout } from './playground-layout';

describe('PlaygroundLayout', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaygroundLayout],
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideTourKit()],
    }).compileComponents();
  });

  it('should create and render nav', () => {
    const fixture = TestBed.createComponent(PlaygroundLayout);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect((fixture.nativeElement as HTMLElement).querySelector('nav')).toBeTruthy();
  });

  it('exposes stable tour anchors on the shell', () => {
    const fixture = TestBed.createComponent(PlaygroundLayout);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('[data-tour="record-button"]')).toBeTruthy();
    expect(host.querySelector('[data-tour="manage-tours-link"]')).toBeTruthy();
  });

  it('toggles the mobile navigation drawer', () => {
    const fixture = TestBed.createComponent(PlaygroundLayout);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const shell = host.querySelector('.shell') as HTMLElement;
    const menu = host.querySelector('[aria-label="Open navigation"]') as HTMLButtonElement;
    const backdrop = host.querySelector('[aria-label="Close navigation"]') as HTMLButtonElement;

    expect(menu).toBeTruthy();
    expect(backdrop).toBeTruthy();
    expect(shell.classList.contains('shell--nav-open')).toBe(false);

    menu.click();
    fixture.detectChanges();
    expect(shell.classList.contains('shell--nav-open')).toBe(true);

    backdrop.click();
    fixture.detectChanges();
    expect(shell.classList.contains('shell--nav-open')).toBe(false);
  });

  it('links leave playground back to marketing home', () => {
    const fixture = TestBed.createComponent(PlaygroundLayout);
    fixture.detectChanges();
    const leave = (fixture.nativeElement as HTMLElement).querySelector(
      '.sidebar__leave',
    ) as HTMLAnchorElement;
    expect(leave).toBeTruthy();
    expect(leave.getAttribute('href') ?? leave.getAttribute('ng-reflect-router-link')).toBeTruthy();
  });
});
