export class CssValue {
  val: number;
  units: string;

  constructor(val: number, units: string) {
    this.val = val;
    this.units = units;
  }


  clone(newVal: CssValue) {
    this.val = newVal.val;
    this.units = newVal.units;
  }
}
