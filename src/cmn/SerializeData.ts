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
  }
  suit: Suit;
  no: CardNo;
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
        no: this.no
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
