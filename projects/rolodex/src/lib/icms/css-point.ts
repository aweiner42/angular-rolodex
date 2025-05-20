import {CssValue} from './css-value';

export class CssPoint {
  x: CssValue;
  y: CssValue;
  z: CssValue;

  constructor(x: CssValue, y: CssValue, z: CssValue) {
    this.x = x;
    this.y = y;
    this.z = z;
  }


  clone(newPoint: CssPoint) {
    this.x.clone(newPoint.x);
    this.y.clone(newPoint.y);
    this.z.clone(newPoint.z);
  }

  add(newPoint: CssPoint) {
    this.x.val = this.x.val + newPoint.x.val;
    this.y.val = this.y.val + newPoint.y.val;
    this.z.val = this.z.val + newPoint.z.val;
  }

  scale(scale: number) {
    this.x.val = this.x.val * scale;
    this.y.val = this.y.val * scale;
    this.z.val = this.z.val * scale;
  }

  mag(): number {
    // magnitude of point
    return (
      Math.sqrt(
        (this.x.val * this.x.val) +
        (this.y.val * this.y.val) +
        (this.z.val * this.z.val)
      )
    );
  }
}


