import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { MarketingLayout } from './marketing-layout';

describe('MarketingLayout', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketingLayout],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();
  });

  it('renders primary marketing navigation', () => {
    const fixture = TestBed.createComponent(MarketingLayout);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const text = host.textContent ?? '';

    expect(text).toContain('Product');
    expect(text).toContain('Features');
    expect(text).toContain('Docs');
    expect(text).toContain('Examples');
    expect(text).toContain('Playground');
  });
});
