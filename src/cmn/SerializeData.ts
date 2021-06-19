import { assert } from "console";
import { SharedSettings } from "./SharedSettings";

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
  fromJson(jsonObj: any) {
    Object.assign(this, jsonObj);
    return this;
  }
}

export class MatchSpeedPlayerSerialized {
  player = new PlayerSerialized();
  hand: Card[] = [];
  deckLen: number = 0;
  fromJSON(jsonObj: any) {
    this.player = new PlayerSerialized().fromJson(jsonObj.player);
    for(let c of jsonObj.hand) {
      this.hand.push(new Card().fromJSON(c));
    }
    this.deckLen = jsonObj.deckLen;
    return this;
  }
}

interface EachPlayers {
  my: MatchSpeedPlayerSerialized;
  opponent: MatchSpeedPlayerSerialized;
}

export class MatchSpeedSerialized {
  players: MatchSpeedPlayerSerialized[] = [];
  layout: Card[] = [];
  getEachPlayers(idstr: string): EachPlayers | null {
    if (this.players.length == SharedSettings.SPD_PLAYER_NUM) {
      if (this.players[0].player.strSocketID === idstr) {
        return { my: this.players[0], opponent: this.players[1] };
      }
      if (this.players[1].player.strSocketID === idstr) {
        return { my: this.players[1], opponent: this.players[0] };
      }
      console.assert(false);
    }
    return null;
  }
  fromJSON(jsonObj: any) {
    if (!jsonObj) return this;
    for(let p of jsonObj.players) {
      this.players.push(new MatchSpeedPlayerSerialized().fromJSON(p));
    }
    for(let c of jsonObj.layout) {
      this.layout.push(new Card().fromJSON(c));
    }
    return this;
  }
}

export class RoomSerialized {
  match: MatchSpeedSerialized = new MatchSpeedSerialized();
  fromJSON(jsonObj: any) {
    this.match = new MatchSpeedSerialized().fromJSON(jsonObj.match);
    return this;
  }
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
