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

interface Card {
  suit: Suit;
  no: CardNo;
}

class MatchSpeedPlayer {
  constructor(player: Player) {
    this.player = player;
  }
  player: Player;
  deck: Card[]=[];
  hand: Card[]=[]; //手札
}

export class MatchSpeed {
  constructor(p0: Player, p1: Player) {
    this.players = [new MatchSpeedPlayer(p0), new MatchSpeedPlayer(p1)];
    this.initMatch();
    console.log("create match:" + p0.strSocketID + " : " + p1.strSocketID);
  }

  players: MatchSpeedPlayer[] = [];
  delReq: boolean = false;
  needDel: boolean = false;

  initMatch() {
    function addSuitAll(p:MatchSpeedPlayer, suit:Suit){
      for(let n=CardNo.Start;n<CardNo.Max;++n){
        p.deck.push({ suit: suit, no: n});
      }
    }
    //配る
    addSuitAll(this.players[0], Suit.Spade);
    addSuitAll(this.players[0], Suit.Club);
    addSuitAll(this.players[1], Suit.Diamond);
    addSuitAll(this.players[1], Suit.Heart);
    //shuffle
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
}