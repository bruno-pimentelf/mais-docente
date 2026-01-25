import { Rect } from 'konva/lib/shapes/Rect';

export function borderAsAnchorStyleFunc(anchor: Rect, height: number) {
  if (anchor.hasName('middle-left') || anchor.hasName('middle-right')) {
    anchor.hitFunc((ctx) => {
      ctx.beginPath();
      ctx.rect(0, -height / 2 + 20, anchor.width(), height);
      ctx.closePath();
      ctx.fillStrokeShape(anchor);
    });
  }
}
