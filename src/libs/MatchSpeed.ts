import assert from 'assert'
import { Player } from '../libs/Player';
import { Suit, CardNo, Card, MatchState, ResultState } from '../cmn/SerializeData';
import { Rng } from '../cmn/Util';
import { SharedSettings } from '../cmn/SharedSettings';
import { GameSettings } from './GameSettings';

class LayoutInfo {
  validNums = new Set<CardNo>();
  card = new Card();
  //山クリア
  resetStack() {
    this.validNums.clear();
  }
  //カード出せる?
  canPlayACard(c: Card) {
    if (c.isInvalid()) return false; //無効なカードは使えない
    if (this.card.isInvalid()) return false; //まだカード出してない場合出せない
    if (this.validNums.size <= 0) return true; //ない場合とにかく出せる
    if (c.isJoker()) return true; //Jockerとにかく出せる
    return this.validNums.has(c.no);
  }
  set(card: Card){
    if (card.isJoker()) {
      if (this.validNums.size > 0) {
        const newset = new Set<CardNo>();
        for (const n of this.validNums) {
          newset.add(n-1);
          newset.add(n+1);
        }
        this.validNums = newset;
      }
    } else {
      this.resetStack();
      this.validNums.add(Card.modCardNo(card.no-1));
      this.validNums.add(Card.modCardNo(card.no+1));
    }
    this.card = card;
  }
  toJSON() {
    return this.card.toJSON();
  }
}

class MatchSpeedPlayer {
  constructor(player: Player) {
    this.player = player;
    this.player.matchStart();
    for (let i = 0; i < MatchSpeedPlayer.HAND_CARD_NUM; ++i) {
      this.hand.push(new Card());
    }
  }
  dest() {
    this.player.matchEnd();
  }
  player: Player;
  deck: Card[] = [];
  hand: Card[] = []; //手札
  static readonly HAND_CARD_NUM = SharedSettings.SPD_HAND_CARD_NUM;

  //カードの補充できる場合,true
  canDecToHand(): boolean {
    for (let i = 0; i < this.hand.length; ++i) {
      if (this.hand[i].isInvalid() && this.deck.length) {
        return true;
      }
    }
    return false;
  }

  //isFillだったら出せるだけ出す
  deckToHand(isFill: boolean = false) {
    for (let i = 0; i < this.hand.length; ++i) {
      if (this.hand[i].isInvalid() && this.deck.length) {
        this.hand[i] = this.deck.pop()!;
        if (!isFill) return;
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
        this.hand[i] = Card.empty;
        return ret;
      }
    }
    return Card.empty; //cardない場合
  }

  //何かカード出せる場合,true
  canPlayAnyCard(layout: LayoutInfo[]): boolean {
    if (this.canDecToHand()) return true; //補充できる場合,true
    for (const lo of layout) {
      for (const c of this.hand) {
        if (lo.canPlayACard(c)) return true;
      }
    }
    return false;
  }

  update(layout: LayoutInfo[]) {
    for(const pac of this.player.playACards) {
      //手札追加
      if (pac.isDecToHand()){
        this.deckToHand(); //1枚手札に
        continue;
      }

      const h = this.hand[pac.handIdx];
      const lo = layout[pac.layoutIdx];
      if (!h || !lo) {
        assert(false);
        continue;
      }
      if (!lo.canPlayACard(h)) {
        break;
      } 
      lo.set(h); //場札に出す
      //手札消す
      this.hand[pac.handIdx] = Card.empty;
    }
    this.player.clearPlayACard(); //やったら消す
  }

  //終わった?
  isFinished(): boolean {
    if (this.deck.length) return false;
    for (const h of this.hand) {
      if (!h.isInvalid()) return false;
    }
    return true;
  }

  toJSON() {
    return Object.assign(
      {
        hand: this.hand,
        deckLen: this.deck.length,
        player: this.player,
        dragInfo: this.player.dragInfo,
      }
    );
  }
}

function shuffleCards(array: Card[]) { //destructive method
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

export class MatchSpeed {
  constructor(uuid: string, p0: Player, p1: Player) {
    this.uuid = uuid;
    this.players = [new MatchSpeedPlayer(p0), new MatchSpeedPlayer(p1)];
    this.initMatch();
    console.log("create match["+uuid+"]:" + p0.strSocketID + " : " + p1.strSocketID);
  }
  dest() {
    this.players.forEach(p => { p.dest(); });
  }

  delReq: boolean = false;
  needDel: boolean = false;
  uuid: string;
  matchState: MatchState = MatchState.StartWait;
  matchTime: number = 0; //match経過時間
  miscTime: number = 0;
  resultState: ResultState = ResultState.Invalid;
  players: MatchSpeedPlayer[] = [];
  layout: LayoutInfo[] = [ new LayoutInfo(), new LayoutInfo() ]; //場札情報
  static readonly PLAYER_NUM = 2;

  initMatch() {
    function addSuitAll(p:MatchSpeedPlayer, suit:Suit){
      for (let n = CardNo.Start; n < CardNo.Max; ++n) {
        p.deck.push(new Card(suit, n));
      }
    }
    function addJocker(p:MatchSpeedPlayer){
      p.deck.push(new Card(Suit.Joker));
    }
    //配る
    addSuitAll(this.players[0], Suit.Spade);
    addSuitAll(this.players[0], Suit.Club);
    addSuitAll(this.players[1], Suit.Diamond);
    addSuitAll(this.players[1], Suit.Heart);
    for(let p of this.players){
      addJocker(p);
    }
    this.players.forEach((mp)=>{
      shuffleCards(mp.deck);
      //set hand
      mp.deckToHand(true);
    });
    assert(this.layout.length == MatchSpeed.PLAYER_NUM);
    assert(this.players.length == MatchSpeed.PLAYER_NUM);
    // match state
    this.setStatrWaitState();
  }

  //誰かカード出せる?
  canPlayACardAnyPlayer() : boolean {
    for (const p of this.players) {
      if (p.canPlayAnyCard(this.layout)) return true;
    }
    return false;
  }

  //場札に出す
  putLayout() {
    for (let i = 0; i < MatchSpeed.PLAYER_NUM; ++i) {
      const c = this.players[i].popCard();
      if (!c.isInvalid()) { //カードが有効なら出す
        const lo = this.layout[i];
        lo.resetStack();
        lo.set(c);
      }
    }
  }

  //playerの更新
  updatePlayers() {
    const plnum = this.players.length; //2
    const ofs = Rng.randiMax(plnum-1); //0,1,update順randomにするだけ
    for (let i = 0; i < plnum; ++i) {
      this.players[(i+ofs)%plnum].update(this.layout);
    }
  }

  private checkFinished() : ResultState{
    let isDraw = true;
    let result = ResultState.Invalid;
    for (let i = 0; i < this.players.length; ++i) {
      const pisf = this.players[i].isFinished();
      if (pisf) {
        if (i==0) result = ResultState.P0Win;
        else result = ResultState.P1Win;
      }
      isDraw &&= pisf;
    }
    if (isDraw) {
      result = ResultState.Draw;
    }
    return result;
  }

  update(fDeltaTime: number) {
    if (!this.delReq) {
      this.pudateMatch(fDeltaTime);
    } else {
      this.needDel = true;
    }
  }

  private setMiscTime(v: number){
    this.miscTime = v;
  }
  private updMiscTime(fDeltaTime: number) {
    this.miscTime -= fDeltaTime;
    return (this.miscTime <= 0);
  }
  private setStatrWaitState() {
    this.setMiscTime(GameSettings.START_WAIT_SEC);
    this.matchState = MatchState.StartWait;
  }
  private setPutLayoutWaitState() {
    this.setMiscTime(GameSettings.PUT_LAYOUT_WAIT_SEC);
    this.matchState = MatchState.PutLayoutWait;
  }
  private setPlayingState() {
    this.setMiscTime(0);
    this.matchState = MatchState.Playing;
  }
  private setFinishState() {
    this.setMiscTime(GameSettings.FINISHD_WAIT_SEC);
    this.matchState = MatchState.Finished;
  }
  private pudateMatch(fDeltaTime: number) {
    switch (this.matchState) {
      case MatchState.StartWait:
        if(this.updMiscTime(fDeltaTime)) {
          this.putLayout(); //場札だして開始
          this.setPlayingState();
        }
        break;
      case MatchState.PutLayoutWait:
        if(this.updMiscTime(fDeltaTime)) {
          this.putLayout(); //出せるカードないので場札更新
          this.setPlayingState();
        }
        break;
      case MatchState.Playing:
        this.matchTime += fDeltaTime; //match時間更新
        this.updatePlayers();
        //勝ち判定
        this.resultState = this.checkFinished();
        if (this.resultState != ResultState.Invalid) {
          this.setFinishState();
        } else if (!this.canPlayACardAnyPlayer()) {
          this.setPutLayoutWaitState(); //場札更新へ
        }
        break;
      case MatchState.Finished:
        if (this.updMiscTime(fDeltaTime)) {
          this.deleteRequest(); //終わりへ
        }
        break;
      default:
        break;
    }
  }

  isIncluedPlayer(p: Player): boolean {
    return (this.players[0].player === p || this.players[1].player === p);
  }

  deleteRequest(){
    this.delReq = true;
    console.log("delete match["+this.uuid+"]:" + this.players[0].player.strSocketID + " : " + this.players[1].player.strSocketID);
  }

  toJSON() {
    return Object.assign(
      {
        uuid: this.uuid,
        matchState: this.matchState,
        resultState: this.resultState,
        matchTime: this.matchTime,
        miscTime: this.miscTime,
        players: this.players,
        layout: this.layout
      }
    );
  }
}