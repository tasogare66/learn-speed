import { assert } from "console";
import { SharedSettings } from "./SharedSettings";

export interface Vec2f {
  x: number;
  y: number;
};

export interface ImgRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
};

export const Suit = {
  None: 'none',
  Spade: 'spade',
  Club: 'club',
  Diamond: 'diamond',
  Heart: 'heart',
  Joker: 'joker'
} as const;
export type Suit = typeof Suit[keyof typeof Suit];

export enum CardNo {
  Start = 0,
  Ace = Start,
  Deuce,
  Three,
  Four,
  Five,
  Six,
  Seven,
  Eight,
  Nine,
  Ten,
  Jack,
  Queen,
  King,
  Max
}

export class Card {
  constructor(suit: Suit = Suit.None, no: CardNo = CardNo.Max) {
    this.suit = suit;
    this.no = no;
    this.id = Number.MIN_SAFE_INTEGER;
  }
  suit: Suit;
  no: CardNo;
  id: number;
  static readonly empty: Card = new Card();
  isInvalid(): boolean {
    return (this.suit === Suit.None);
  }
  isJoker(): boolean {
    return (this.suit === Suit.Joker);
  }
  static modCardNo(n: CardNo): CardNo {
    while (n < 0) {
      n += CardNo.Max;
    }
    n %= CardNo.Max;
    return n;
  }
  toJSON() {
    return Object.assign(
      {
        suit: this.suit,
        no: this.no,
        id: this.id,
      }
    );
  }
  fromJSON(jsonObj: any) {
    Object.assign(this, jsonObj);
    return this;
  }
}

export class PlayerSerialized {
  strSocketID: string = "";
  nickName: string = "";
  fromJSON(jsonObj: any) {
    Object.assign(this, jsonObj);
    return this;
  }
}

export enum MatchState {
  StartWait = 0,
  Playing,
  PutLayoutWait,
  Finished,
  Max
}

export enum ResultState {
  Invalid = 0, //未決
  P0Win,
  P1Win,
  Draw,
}

//client->server
export class PlayACard {
  handIdx: number = -1;
  layoutIdx: number = -1;
  isValidHand() {
    return (this.handIdx >= 0 && this.layoutIdx >= 0);
  }
  setDecToHand() {
    this.clear();
    this.handIdx = SharedSettings.SPD_HAND_CARD_NUM;
  }
  isDecToHand() {
    return (this.handIdx === SharedSettings.SPD_HAND_CARD_NUM);
  }
  clear() {
    this.handIdx = -1;
    this.layoutIdx = -1;
  }
  toJSON() {
    return Object.assign(
      {
        handIdx: this.handIdx,
        layoutIdx: this.layoutIdx,
      }
    );
  }
  fromJSON(jsonObj: any) {
    Object.assign(this, jsonObj);
    return this;
  }
}

export class DragInfo {
  handIdx: number = -1;
  id: number = Number.MIN_SAFE_INTEGER;
  x: number = Number.MIN_SAFE_INTEGER;
  y: number = Number.MIN_SAFE_INTEGER;
  isValid() {
    if (this.handIdx < 0) return false;
    if (this.id < 0) return false;
    if (this.x === Number.MIN_SAFE_INTEGER) return false;
    return true;
  }
  isSame(info: DragInfo): boolean {
    if (this.handIdx !== info.handIdx) return false;
    if (this.id !== info.id) return false;
    if (this.x !== info.x) return false;
    if (this.y !== info.y) return false;
    return true;
  }
  toJSON() {
    return Object.assign({
      handIdx: this.handIdx,
      id: this.id,
      x: this.x,
      y: this.y,
    });
  }
  fromJSON(jsonObj: any) {
    Object.assign(this, jsonObj);
    return this;
  }
}
