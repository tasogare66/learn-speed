import { assert } from "console";

export class Util {
  static deg2rad(deg: number): number {
    return deg * (Math.PI / 180.0);
  }
}
export class Rng {
  //[0.0-1.0)
  static randf(): number {
    return Math.random();
  }
  //[0.0-range)
  static randfMax(max: number) {
    return this.randf() * max;
  }
  //[min-max)
  static randfMinMax(min: number, max: number) {
    return this.randfMax(max - min) + min;
  }
  //[0-max]
  static randiMax(max: number) {
    const imax = Math.floor(max);
    assert(max === imax);
    assert(imax >= 0);
    const d = this.randf();
    const u = Math.floor(imax + 1);
    return Math.floor(d * u);
  }
  //[min-max]
  static randiMinMax(min: number, max: number) {
    const imin = Math.floor(min);
    const imax = Math.floor(max);
    assert(imin === min && imax === max);
    assert(imax - imin >= 0);
    const d = this.randf();
	  const u = Math.floor(imax - imin + 1);
	  return (Math.floor(d * u) + min);
  }
}