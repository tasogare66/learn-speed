import { ImgRect } from './SerializeData';

export function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg || "Assertion failed");  }
}

export class Util {
  static deg2rad(deg: number): number {
    return deg * (Math.PI / 180.0);
  }
  static pointInRect(rect: ImgRect, px: number, py: number)
  {
    const left = rect.sx;
    const top = rect.sy;
    const right = rect.sx+rect.sw;
    const bottom = rect.sy+rect.sh;
    return (left <= px && px <= right
      && top <= py && py <= bottom);
  }
  //array自体を変更する破壊的
  static shuffleArrayDestructive<T>(array: T[]) { //destructive method
    const length = array == null ? 0 : array.length
    if (!length) {
      return; //return [];
    }
    let index = -1
    const lastIndex = length - 1;
    const result = array; //copyArray(array)
    while (++index < length) {
      const rand = index + Math.floor(Rng.randf() * (lastIndex - index + 1));
      const value = result[rand];
      result[rand] = result[index];
      result[index] = value;
    }
    //return result
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