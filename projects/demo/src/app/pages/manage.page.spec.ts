import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTourKit } from '@mfontecchio/ng-tourkit';
import { ManagePage } from './manage.page';

describe('ManagePage', () => {
  let fixture: ComponentFixture<ManagePage>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ManagePage],
      providers: [provideZonelessChangeDetection(), provideTourKit()],
    }).compileComponents();

    fixture = TestBed.createComponent(ManagePage);
    fixture.detectChanges();
  });

  it('exposes a stable manage-title tour anchor', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('[data-tour="manage-title"]')).toBeTruthy();
  });
});
