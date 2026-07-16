export interface StageRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export function stageSvgPath(
  viewportW: number,
  viewportH: number,
  stage: StageRect | null,
  padding: number,
  radius: number,
): string {
  const outer = `M0,0H${viewportW}V${viewportH}H0Z`;

  if (!stage) {
    return outer;
  }

  const safePadding = Math.max(0, padding);
  const x = stage.x - safePadding;
  const y = stage.y - safePadding;
  const width = Math.max(0, stage.width + safePadding * 2);
  const height = Math.max(0, stage.height + safePadding * 2);
  const right = x + width;
  const bottom = y + height;
  const safeRadius = Math.max(
    0,
    Math.min(Math.floor(radius), width / 2, height / 2),
  );

  if (safeRadius === 0) {
    return `${outer}M${x},${y}H${right}V${bottom}H${x}Z`;
  }

  return `${outer}M${x + safeRadius},${y}H${right - safeRadius}Q${right},${y} ${right},${y + safeRadius}V${bottom - safeRadius}Q${right},${bottom} ${right - safeRadius},${bottom}H${x + safeRadius}Q${x},${bottom} ${x},${bottom - safeRadius}V${y + safeRadius}Q${x},${y} ${x + safeRadius},${y}Z`;
}

