import IVector from 'maplestory/dist/PKG1/IVector';

export class RenderableBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;

  offset: IVector;
  size: IVector;

  zoom: number;

  constructor(lefts: Array<number>, rights: Array<number>, tops: Array<number>, bottoms: Array<number>, zoom?: number) {
    this.left = Math.min.apply(null, lefts);
    this.right = Math.max.apply(null, rights);
    this.top = Math.min.apply(null, tops);
    this.bottom = Math.max.apply(null, bottoms);

    this.zoom = zoom || 1;

    (this.offset = {
      x: -this.left, // TODO: Validate if these are ever non-negative
      y: -this.top,
    }),
      (this.size = {
        x: (this.right - this.left) * this.zoom,
        y: (this.bottom - this.top) * this.zoom,
      });
  }
}
