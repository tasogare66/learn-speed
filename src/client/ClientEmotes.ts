import { EmoteType, ImgRect } from "../cmn/SerializeData";
import { Util } from "../cmn/Util";

export class ClientEmote {
  constructor(type: EmoteType) {
    this.type = type;
  }
  type: EmoteType;
  rect: ImgRect = { sx: 0, sy: 0, sw: 32, sh: 38 };
  touchRect: ImgRect = { sx: 0, sy: 0, sw: 32, sh: 38 };
  setPos(px: number, py: number) {
    this.rect.sx = px;
    this.rect.sy = py;
    this.touchRect = this.rect;
  }
  pointInRect(px: number, py: number): boolean {
    return Util.pointInRect(this.touchRect, px, py);
  }
}

export class ClientPlayerEmotes {

}