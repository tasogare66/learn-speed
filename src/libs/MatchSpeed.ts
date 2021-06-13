import { assert } from 'console';
import { Player } from '../libs/Player';

const Suit = {
  None: 'none',
  Spade: 'spade',
  Club: 'club',
  Diamond: 'diamond',
  Heart: 'heart'
} as const;
type Suit = typeof Suit[keyof typeof Suit];

enum CardNo {
  Start=0,
  Ace=Start,
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

class Card {
  constructor(suit: Suit = Suit.None, no: CardNo = CardNo.Max) {
    this.suit = suit;
    this.no = no;
  }
  suit: Suit;
  no: CardNo;
  isInvalid(): boolean {
    return (this.suit===Suit.None);
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

class MatchSpeedPlayer {
  constructor(player: Player) {
    this.player = player;
    for (let i = 0; i < MatchSpeedPlayer.HAND_CARD_NUM; ++i) {
      this.hand.push(new Card());
    }
  }
  player: Player;
  deck: Card[] = [];
  hand: Card[] = []; //手札
  static readonly HAND_CARD_NUM = 4;

  deckToHand() {
    for (let i = 0; i < this.hand.length; ++i) {
      if (this.hand[i].isInvalid() && this.deck.length) {
        this.hand[i] = this.deck.pop()!;
      }
    }
  }

  popCard(): Card {
    if (this.deck.length) {
      return this.deck.pop()!;
    }
    for (let i = 0; i < this.hand.length; ++i) {
      if (this.hand[i] && !this.hand[i].isInvalid()) {
        const ret = this.hand[i];
        this.hand[i] = new Card();
        return ret;
      }
    }
    assert(0);
    return new Card();
  }

  toJSON() {
    return Object.assign(
      {
        hand: this.hand,
        deckLen: this.deck.length,
      }
    );
  }
}

export class MatchSpeed {
  constructor(p0: Player, p1: Player) {
    this.players = [new MatchSpeedPlayer(p0), new MatchSpeedPlayer(p1)];
    this.initMatch();
    console.log("create match:" + p0.strSocketID + " : " + p1.strSocketID);
  }

  delReq: boolean = false;
  needDel: boolean = false;
  players: MatchSpeedPlayer[] = [];
  layout: Card[] = new Array(2); //場札

  initMatch() {
    function addSuitAll(p:MatchSpeedPlayer, suit:Suit){
      for (let n = CardNo.Start; n < CardNo.Max; ++n) {
        p.deck.push(new Card(suit, n));
      }
    }
    //配る
    addSuitAll(this.players[0], Suit.Spade);
    addSuitAll(this.players[0], Suit.Club);
    addSuitAll(this.players[1], Suit.Diamond);
    addSuitAll(this.players[1], Suit.Heart);
    this.players.forEach((mp)=>{
      //shuffle

      //set hand
      mp.deckToHand();
    });
  }

  update(fDeltaTime: number) {
    if (!this.delReq) {

    } else {
      this.needDel = true;
    }
  }

  isIncluedPlayer(p: Player): boolean {
    return (this.players[0].player === p || this.players[1].player === p);
  }

  deleteRequest(){
    this.delReq = true;
    console.log("delete match:" + this.players[0].player.strSocketID + " : " + this.players[1].player.strSocketID);
  }

  toJSON() {
    return Object.assign(
      {
        players: this.players,
        layout: this.layout
      }
    );
  }
}