export const Suit = {
  None: 'none',
  Spade: 'spade',
  Club: 'club',
  Diamond: 'diamond',
  Heart: 'heart'
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
  isInvalid(): boolean {
    return (this.suit === Suit.None);
  }
  toJSON() {
    return Object.assign(
      {
        suit: this.suit,
        no: this.no
      }
    );
  }
}

export class MatchSpeedPlayerSerialized {
  hand: Card[] = [];
  deckLen: number = 0;
}

export class MatchSpeedSerialized {
  players: MatchSpeedPlayerSerialized[] = [];
  layout: Card[] = [];
}

export class RoomSerialized {
  match: MatchSpeedSerialized = new MatchSpeedSerialized();
}
