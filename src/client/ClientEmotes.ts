import { EmoteType, ImgRect } from "../cmn/SerializeData";
import { SharedSettings } from "../cmn/SharedSettings";
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
    const tofs = 6;
    this.touchRect.sx = this.rect.sx - tofs;
    this.touchRect.sy = this.rect.sy - tofs;
    this.touchRect.sw = this.rect.sw + tofs*2;
    this.touchRect.sh = this.rect.sh + tofs*2;
  }
  pointInRect(px: number, py: number): boolean {
    return Util.pointInRect(this.touchRect, px, py);
  }
}

export class ClientPlayerEmotes {
  emotes: ClientEmote[] = [];
  push(et: EmoteType) {
    const emote = new ClientEmote(et);
    emote.rect.sx = 0;
    emote.rect.sy = 900-20;
    this.emotes.push(emote);
  }
  regularUpdate(fDeltaTime: number) {
    if (this.emotes.length <= 0) return;
    for(const e of this.emotes){
      e.rect.sx += (fDeltaTime*180);
    }
    this.emotes = this.emotes.filter(e => {
      return (e.rect.sx < SharedSettings.CANVAS_WIDTH);
    });
  }
}