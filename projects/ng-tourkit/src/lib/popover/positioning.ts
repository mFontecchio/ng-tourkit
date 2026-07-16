import { PopoverAlign, PopoverSide } from '../models/tour.models';

export interface DOMRectLike {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface PopoverPositionInput {
  readonly targetRect: DOMRectLike | null;
  readonly popoverSize: { readonly width: number; readonly height: number };
  readonly viewport: { readonly width: number; readonly height: number };
  readonly side: PopoverSide;
  readonly align: PopoverAlign;
  readonly gap?: number;
  readonly padding?: number;
}

export interface PopoverPosition {
  readonly top: number;
  readonly left: number;
  readonly actualSide: PopoverSide;
  readonly arrow: {
    readonly side: 'top' | 'right' | 'bottom' | 'left';
    readonly offset: number;
  } | null;
}

const ARROW_EDGE_PADDING = 12;

export function computePopoverPosition(input: PopoverPositionInput): PopoverPosition {
  const gap = input.gap ?? 10;
  const padding = input.padding ?? 10;
  const width = input.popoverSize.width;
  const height = input.popoverSize.height;

  if (!input.targetRect || input.side === 'over') {
    return {
      top: clamp((input.viewport.height - height) / 2, padding, input.viewport.height - height - padding),
      left: clamp((input.viewport.width - width) / 2, padding, input.viewport.width - width - padding),
      actualSide: 'over',
      arrow: null,
    };
  }

  const target = input.targetRect;
  const side = chooseSide(input.side, target, input.popoverSize, input.viewport, gap);
  const raw = rawPosition(side, input.align, target, width, height, gap);
  const top = clamp(raw.top, padding, input.viewport.height - height - padding);
  const left = clamp(raw.left, padding, input.viewport.width - width - padding);

  return {
    top,
    left,
    actualSide: side,
    arrow: arrowForSide(side, target, { top, left, width, height }),
  };
}

function chooseSide(
  preferred: Exclude<PopoverSide, 'over'>,
  target: DOMRectLike,
  size: { readonly width: number; readonly height: number },
  viewport: { readonly width: number; readonly height: number },
  gap: number,
): Exclude<PopoverSide, 'over'> {
  const spaces = {
    top: target.y,
    right: viewport.width - (target.x + target.width),
    bottom: viewport.height - (target.y + target.height),
    left: target.x,
  };
  const fits = (side: Exclude<PopoverSide, 'over'>): boolean =>
    spaces[side] >= (side === 'top' || side === 'bottom' ? size.height : size.width) + gap;

  if (fits(preferred)) {
    return preferred;
  }

  const opposite = oppositeSide(preferred);
  if (fits(opposite)) {
    return opposite;
  }

  return (Object.entries(spaces) as Array<[Exclude<PopoverSide, 'over'>, number]>)
    .sort((a, b) => b[1] - a[1])[0][0];
}

function rawPosition(
  side: Exclude<PopoverSide, 'over'>,
  align: PopoverAlign,
  target: DOMRectLike,
  width: number,
  height: number,
  gap: number,
): { top: number; left: number } {
  if (side === 'top' || side === 'bottom') {
    return {
      top: side === 'top' ? target.y - height - gap : target.y + target.height + gap,
      left: alignedPosition(target.x, target.width, width, align),
    };
  }

  return {
    top: alignedPosition(target.y, target.height, height, align),
    left: side === 'left' ? target.x - width - gap : target.x + target.width + gap,
  };
}

function alignedPosition(
  targetStart: number,
  targetSize: number,
  popoverSize: number,
  align: PopoverAlign,
): number {
  if (align === 'start') {
    return targetStart;
  }

  if (align === 'end') {
    return targetStart + targetSize - popoverSize;
  }

  return targetStart + targetSize / 2 - popoverSize / 2;
}

function arrowForSide(
  side: Exclude<PopoverSide, 'over'>,
  target: DOMRectLike,
  popover: { readonly top: number; readonly left: number; readonly width: number; readonly height: number },
): PopoverPosition['arrow'] {
  const targetCenterX = target.x + target.width / 2;
  const targetCenterY = target.y + target.height / 2;

  if (side === 'top') {
    return {
      side: 'bottom',
      offset: clamp(targetCenterX - popover.left, ARROW_EDGE_PADDING, popover.width - ARROW_EDGE_PADDING),
    };
  }

  if (side === 'bottom') {
    return {
      side: 'top',
      offset: clamp(targetCenterX - popover.left, ARROW_EDGE_PADDING, popover.width - ARROW_EDGE_PADDING),
    };
  }

  if (side === 'left') {
    return {
      side: 'right',
      offset: clamp(targetCenterY - popover.top, ARROW_EDGE_PADDING, popover.height - ARROW_EDGE_PADDING),
    };
  }

  return {
    side: 'left',
    offset: clamp(targetCenterY - popover.top, ARROW_EDGE_PADDING, popover.height - ARROW_EDGE_PADDING),
  };
}

function oppositeSide(side: Exclude<PopoverSide, 'over'>): Exclude<PopoverSide, 'over'> {
  const opposites = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
  } as const;

  return opposites[side];
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

