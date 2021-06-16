import { assert } from 'console';
import { Player } from '../libs/Player';
import { Suit, CardNo, Card } from '../cmn/SerializeData';

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

  //カードの補充できる場合,true
  canDecToHand(): boolean {
    for (let i = 0; i < this.hand.length; ++i) {
      if (this.hand[i].isInvalid() && this.deck.length) {
        return true;
      }
    }
    return false;
  }

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

  canUseCard() : boolean {
    //FIXME:  
    return false;
  }

  //何かカード出せる場合,true
  canUseAnyCard(): boolean {
    if (this.canDecToHand()) return true; //補充できる場合,true
    //FIXME:  
    return false;
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
  static readonly PLAYER_NUM = 2;

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
    assert(this.layout.length == MatchSpeed.PLAYER_NUM);
    assert(this.players.length == MatchSpeed.PLAYER_NUM);
  }

  //カード出せる?
  canPlayACardAnyPlayer() : boolean {
    for (let i=0;i<this.layout.length;++i) {
      if(!this.layout[i]) return false; //カード出ていない場合出せない
    }
    return true;
  }

  //場札に出す
  putLayout() {
    for (let i = 0; i < MatchSpeed.PLAYER_NUM; ++i) {
      this.layout[i] = this.players[i].popCard();
    }
  }

  update(fDeltaTime: number) {
    if (!this.delReq) {
      if (!this.canPlayACardAnyPlayer()) {
        //出せるカードないので場札更新
        this.putLayout();
      }
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