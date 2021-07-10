import assert from 'assert'
import { Player } from '../libs/Player';
import { Suit, CardNo, Card, MatchState, ResultState, PlayACard } from '../cmn/SerializeData';
import { Rng, Util } from '../cmn/Util';
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
          newset.add(Card.modCardNo(n-1));
          newset.add(Card.modCardNo(n+1));
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
  playACardCnt = -1;
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

  //何かカード出せる場合,true,Jockerは含まない
  canPlayAnyCardIgnoreJocker(layout: LayoutInfo[]): boolean {
    if (this.canDecToHand()) return true; //補充できる場合,true
    for (const lo of layout) {
      for (const c of this.hand) {
        if (c.isJoker()) continue; //jockerは無視
        if (lo.canPlayACard(c)) return true;
      }
    }
    return false;
  }

  //手札が何か出せる場合,true
  canPlayAnyHandCard(layout: LayoutInfo[]): boolean {
    for (const lo of layout) {
      for (const c of this.hand) {
        if (lo.canPlayACard(c)) return true;
      }
    }
    return false;
  }

  //手札にjockerあるか
  hasJockerInHand(){
    for(const c of this.hand){
      if (c.isJoker()) return true;
    }
    return false;
  }

  updatePlayACards(layout: LayoutInfo[]) {
    for(const pac of this.player.playACards) {
      this.playACardCnt = Math.max(this.playACardCnt, pac.counter);
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

  updateBot(layout: LayoutInfo[], fDeltaTime: number) {
  }

  update(layout: LayoutInfo[], fDeltaTime: number) {
    this.updateBot(layout, fDeltaTime);
    this.updatePlayACards(layout);
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
        playACardCnt: this.playACardCnt,
        player: this.player,
        dragInfo: this.player.dragInfo,
        emoteType: this.player.emoteType,
      }
    );
  }
}

class MatchSpeedBotPlayer extends MatchSpeedPlayer {
  private getHnadInterval() {
    return 2; //2sec
  }
  private getDecInterval() {
    return 1; //1sec
  }
  private updHnadTimer(fDeltaTime: number): boolean {
    this.handTimer += fDeltaTime;
    const interval = this.getHnadInterval();
    const ret: boolean = (this.handTimer >= interval);
    this.handTimer %= interval;
    return ret;
  }
  private updDecTimer(fDeltaTime: number): boolean {
    this.decTimer += fDeltaTime;
    const interval = this.getDecInterval();
    const ret: boolean = (this.decTimer >= interval);
    this.decTimer %= interval;
    return ret;
  }
  override updateBot(layout: LayoutInfo[], fDeltaTime: number) {
    //出せたら出す
    if (this.updHnadTimer(fDeltaTime)) {
      do {
        if (this.hand.length <= 0) break;
        let h = this.handIndex++;
        h %= this.hand.length;
        this.handIndex %= this.hand.length;
        for (let l = 0; l < layout.length; ++l) {
          if (layout[l].canPlayACard(this.hand[h])) {
            const pac = new PlayACard();
            pac.handIdx = h;
            pac.layoutIdx = l;
            pac.counter = -1;
            this.player.pushPlayACard(pac);
            return; //やったら終わり
          }
        }
      } while (false);
    }
    //dec to hand
    if (this.updDecTimer(fDeltaTime)) {
      if (this.canDecToHand() && !this.canPlayAnyHandCard(layout)) {
        const pac = new PlayACard();
        pac.setDecToHand();
        this.player.pushPlayACard(pac);
        return; //やったら終わり
      }
    }
  }
  private handTimer: number = 0;
  private handIndex: number = 0;
  private decTimer: number = 0;
}

export class MatchSpeed {
  constructor(uuid: string, p0: Player, p1: Player) {
    this.uuid = uuid;
    const msp0 = p0.isBot ? new MatchSpeedBotPlayer(p0) : new MatchSpeedPlayer(p0);
    const msp1 = p1.isBot ? new MatchSpeedBotPlayer(p1) : new MatchSpeedPlayer(p1);
    this.players = [msp0, msp1];
    this.initMatch();
    console.log("create match["+uuid+"]:" + p0.strSocketID+"("+p0.nickName+")" + " : " + p1.strSocketID+"("+p1.nickName+")");
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
    //id振る,連番
    let cardid = 0;
    for(const p of this.players){
      for (const c of p.deck){
        c.id = cardid++;
      }
    }
    this.players.forEach((mp)=>{
      Util.shuffleArrayDestructive(mp.deck);
      //set hand
      mp.deckToHand(true);
    });
    assert(this.layout.length == MatchSpeed.PLAYER_NUM);
    assert(this.players.length == MatchSpeed.PLAYER_NUM);
    // match state
    this.setStatrWaitState();
  }

  //誰かカード出せる?
  canPlayACardIgnoreJockerAnyPlayer() : boolean {
    for (const p of this.players) {
      if (p.canPlayAnyCardIgnoreJocker(this.layout)) return true;
    }
    return false;
  }

  hasJockerInHandAnyPlayer(): boolean {
    for (const p of this.players) {
      if (p.hasJockerInHand()) return true;
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
  updatePlayers(fDeltaTime: number) {
    const plnum = this.players.length; //2
    const ofs = Rng.randiMax(plnum-1); //0,1,update順randomにするだけ
    for (let i = 0; i < plnum; ++i) {
      this.players[(i+ofs)%plnum].update(this.layout, fDeltaTime);
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
      this.upudateMatch(fDeltaTime);
    } else {
      this.needDel = true;
    }
  }

  postUpdate() {
    for (const p of this.players) {
      p.player.clearEmoteType(); //送信したら消す
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
    this.setMiscTime(GameSettings.JOCKER_WAIT_SEC);
    this.matchState = MatchState.Playing;
  }
  private setFinishState() {
    this.setMiscTime(GameSettings.FINISHD_WAIT_SEC);
    this.matchState = MatchState.Finished;
  }
  private upudateMatch(fDeltaTime: number) {
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
        this.updatePlayers(fDeltaTime);
        //勝ち判定
        this.resultState = this.checkFinished();
        if (this.resultState != ResultState.Invalid) {
          this.setFinishState();
        } else if (!this.canPlayACardIgnoreJockerAnyPlayer()) {
          if (this.hasJockerInHandAnyPlayer()) {
            if (this.updMiscTime(fDeltaTime)) {
              this.setPutLayoutWaitState(); //場札更新へ
            }
          } else {
            this.setPutLayoutWaitState(); //場札更新へ
          }
        } else {
          this.setMiscTime(GameSettings.JOCKER_WAIT_SEC); //jocker待ち時間戻す
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