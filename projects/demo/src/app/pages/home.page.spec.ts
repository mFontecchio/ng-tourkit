import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TkTourEligibility, TkTourService, TourDefinition, provideTourKit } from '@mfontecchio/ng-tourkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from './home.page';
import { WORKFLOW_TOUR, WORKFLOW_TOUR_ID } from '../workflow-tour';

describe('HomePage', () => {
  let fixture: ComponentFixture<HomePage>;
  let start: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    start = vi.fn().mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideZonelessChangeDetection(),
        provideTourKit(),
        {
          provide: TkTourEligibility,
          useValue: {
            eligibleTours: async (): Promise<TourDefinition[]> => [WORKFLOW_TOUR],
          },
        },
        {
          provide: TkTourService,
          useValue: { start },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('renders workflow anchors and the persistent CTA', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('[data-tour="workflow-tour-cta"]')).toBeTruthy();
    expect(host.querySelector('[data-tour="available-tours"]')).toBeTruthy();
    expect(host.textContent).toContain('Take the tour');
  });

  it('starts the stored workflow tour from the CTA', () => {
    const host = fixture.nativeElement as HTMLElement;
    const button = Array.from(host.querySelectorAll('button')).find((candidate) =>
      candidate.textContent?.includes('Take the tour'),
    );

    button?.click();

    expect(start).toHaveBeenCalledWith(
      expect.objectContaining({ id: WORKFLOW_TOUR_ID, name: WORKFLOW_TOUR.name }),
    );
  });
});
