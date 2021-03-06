import { Socket } from 'socket.io-client';
import { ImgRect, Suit, CardNo, Card, PlayerSerialized, PlayACard, Vec2f, MatchState, ResultState, DragInfo, EmoteType, EmoteUtil } from '../cmn/SerializeData';
import { SharedSettings } from "../cmn/SharedSettings";
import { assert, Util } from '../cmn/Util';
import { clientAssets, clientSocket } from './client';
import { ClientEmote, ClientPlayerEmotes } from './ClientEmotes';
import { RenderingSettings } from './RenderingSettings';

export class ClientSocket {
  static emitPlayACard(socket: Socket, pac: PlayACard) {
    socket.emit('play-a-card', pac);
  }
  static emitDragInfo(socket: Socket, di: DragInfo) {
    socket.emit('drag-info', di);
  }
  static emitEmote(socket:Socket, et: EmoteType) {
    socket.emit('emote', et);
  }
}

interface PositionOffset{
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export class ClientCard extends Card {
  constructor(index: number, suit: Suit = Suit.None, no: CardNo = CardNo.Max) {
    super(suit, no);
    this.index = index;
  }
  rect: ImgRect = { sx: 0, sy: 0, sw: RenderingSettings.CARD_WIDTH, sh: RenderingSettings.CARD_HEIGHT };
  baseRect: ImgRect = { sx: 0, sy: 0, sw: RenderingSettings.CARD_WIDTH, sh: RenderingSettings.CARD_HEIGHT };
  touchRect: ImgRect = { sx: 0, sy: 0, sw: RenderingSettings.CARD_WIDTH, sh: RenderingSettings.CARD_HEIGHT };
  touchOffset: PositionOffset = { top: 0, bottom: 0, left: 0, right: 0 };
  index: number;
  playACardCnt = -1;
  setBasePos(px: number, py: number) {
    this.baseRect.sx = px;
    this.baseRect.sy = py;
  }
  setCurPos(px: number, py: number) {
    this.rect.sx = px;
    this.rect.sy = py;
    this.updTouchRect();
  }
  resetCurPos() {
    this.setCurPos(this.baseRect.sx, this.baseRect.sy);
  }
  setBothPos(px: number, py: number) {
    this.setBasePos(px, py);
    this.resetCurPos();
  }
  setTouchOffset(top:number, bottom:number, left:number, right:number){
    this.touchOffset = { top: top, bottom: bottom, left: left, right: right };
  }
  private updTouchRect() {
    this.touchRect.sx = this.rect.sx - this.touchOffset.left;
    this.touchRect.sy = this.rect.sy - this.touchOffset.top;
    this.touchRect.sw = this.rect.sw + this.touchOffset.left + this.touchOffset.right;
    this.touchRect.sh = this.rect.sh + this.touchOffset.top + this.touchOffset.bottom;
  }
  pointInRect(px: number, py: number): boolean {
    return Util.pointInRect(this.touchRect, px, py);
  }
}

export class ClientMatchSpeedPlayer {
  player = new PlayerSerialized();
  hand: ClientCard[] = [];
  deckLen: number = 0;
  recvPlayACardCnt: number = -1; //server?????????????????????
  handIdHist: number[] = [];
  deckLenHist: number = 0;
  netDragInfo: DragInfo = new DragInfo();
  emoteType: EmoteType = EmoteType.Invalid;
  constructor(index: number) {
    this.index = index;
    this.decCard.setTouchOffset(30,30,10,10);
    this.decCard.setBothPos(SharedSettings.CANVAS_HEIGHT-RenderingSettings.CARD_WIDTH-20, SharedSettings.CANVAS_HEIGHT * 3 / 4 - RenderingSettings.CARD_HEIGHT / 2);
  }
  fromJSON(jsonObj: any) {
    this.player.fromJSON(jsonObj.player);
    this.hand.length = jsonObj.hand.length;
    for (let i = 0; i < this.hand.length; ++i) {
      if (!this.hand[i]) this.hand[i] = new ClientCard(i);
      const dsthnd = this.hand[i];
      dsthnd.fromJSON(jsonObj.hand[i]);
      const tmpx = 16; //?????????????????????
      const st = SharedSettings.CANVAS_WIDTH / 2 - tmpx * 3 - RenderingSettings.CARD_WIDTH * 2;
      const inc = RenderingSettings.CARD_WIDTH + 2 * tmpx;
      dsthnd.setTouchOffset(20, 60, 14, 14);
      dsthnd.setBasePos(st + inc * i, SharedSettings.CANVAS_HEIGHT * 3 / 4 - RenderingSettings.CARD_HEIGHT / 2);
    }
    this.deckLen = jsonObj.deckLen;
    this.recvPlayACardCnt = jsonObj.playACardCnt;
    this.netDragInfo.fromJSON(jsonObj.dragInfo);
    this.emoteType = jsonObj.emoteType;
  }
  isSamePlayer(idstr: string) {
    return (this.player.strSocketID === idstr);
  }
  isHandValid(idx: number): boolean {
    if (idx>=0 && idx < this.hand.length) {
      return !this.hand[idx].isInvalid();
    }
    return false;
  }

  updateHnadHist(): boolean {
    let ret=false;
    let initial = (this.handIdHist.length <= 0);
    if (initial) {
      this.deckLenHist = this.deckLen;
    }
    for (let i=0;i<this.hand.length;++i) {
      if (!initial && this.handIdHist[i] !== this.hand[i].id) {
        ret = true;
      }
      this.handIdHist[i] = this.hand[i].id;
    }
    return ret;
  }

  update() {
    if (this.isNetPlayer()) {
      //emote
      if (EmoteUtil.isValidEmoteType(this.emoteType)) {
        this.emotes.push(this.emoteType);
        this.emoteType = EmoteType.Invalid; //clear
      }
      //??????player???dragCard??????
      this.clearDragCard(); //???????????????,??????clear
      if (this.netDragInfo.isValid()) {
        const hidx = this.netDragInfo.handIdx;
        if (this.isHandValid(hidx) && this.hand[hidx].id === this.netDragInfo.id) { //?????????????????????
          this.dragCard = this.hand[hidx];
          this.dragCard.rect.sx = this.netDragInfo.x;
          this.dragCard.rect.sy = this.netDragInfo.y;
        }
      }
    }

    for (const c of this.hand) {
      if (c) {
        if (c===this.dragCard) continue; //drag???
        if (c.playACardCnt>=0 && c.playACardCnt > this.recvPlayACardCnt) continue; //server??????????????????
        c.resetCurPos();
      }
    }

    //playSE
    const slide = this.updateHnadHist();
    const place = (this.deckLen !== this.deckLenHist);
    this.deckLenHist = this.deckLen;
    if (place) {
      clientAssets().playPlaceSE();
    } else if (slide) {
      clientAssets().playSlideSE();
    }
  }

  regularUpdate(fDeltaTime: number) {
    this.emotes.regularUpdate(fDeltaTime);
  }

  index: number;
  isClientPlayer: boolean = false; //???player??????
  decCard: ClientCard = new ClientCard(-1);
  dragCard: ClientCard | null = null;
  dragOffset: Vec2f = { x: 0, y: 0 };
  mousePos: Vec2f = { x: 0, y: 0 };
  dragInfoHist: DragInfo | null = null; //??????????????????DragInfo
  emotes: ClientPlayerEmotes = new ClientPlayerEmotes();
  playACardCnt: number = 0;
  getDragCard() { return this.dragCard; }
  clearDragCard() {
    this.dragCard = null;
    this.dragOffset = { x: 0, y: 0 };
  }
  hasDeck(): boolean { return (this.deckLen > 0); }
  isNetPlayer() { return !this.isClientPlayer; }

  emitDragInfo() {
    const d = new DragInfo();
    const dcard = this.dragCard;
    if (dcard) {
      d.handIdx = dcard.index;
      d.id = dcard.id;
      d.x = dcard.rect.sx;
      d.y = dcard.rect.sy;
    }
    if (!this.dragInfoHist || !this.dragInfoHist.isSame(d)) { //????????????????????????
      ClientSocket.emitDragInfo(clientSocket(), d);
      this.dragInfoHist = d;
    }
  }

  callbackMousedown(posx: number, posy: number) {
    this.clearDragCard();
    //dec??????
    if (this.hasDeck() && this.decCard.pointInRect(posx, posy)) {
      const d = new PlayACard();
      d.setDecToHand();
      ClientSocket.emitPlayACard(clientSocket(), d);
      return;
    }
    //hand??????
    for (const c of this.hand) {
      if (c.isInvalid()) continue;
      if (c.pointInRect(posx, posy)) {
        this.dragCard = c;
        this.dragOffset.x = c.rect.sx - posx;
        this.dragOffset.y = c.rect.sy - posy;
        break;
      }
    }
  }
  callbackMousemove(posx: number, posy: number) {
    this.mousePos.x = posx;
    this.mousePos.y = posy;
    if (this.dragCard) {
      this.dragCard.setCurPos(posx + this.dragOffset.x, posy + this.dragOffset.y);
    }
  }
}

export class ClientMatchSpeed {
  uuid: string = "";
  matchState: MatchState = MatchState.StartWait;
  resultState: ResultState = ResultState.Invalid;
  matchTime: number = 0;
  miscTime: number = 0;
  players: ClientMatchSpeedPlayer[] = [];
  layout: ClientCard[] = [];
  constructor(){
    //EmoteType???????????????shuffle
    let tbl: EmoteType[] = Array(EmoteType.Num);
    for(let i=0;i<tbl.length;++i){ 
      tbl[i]=EmoteType.Start+i;
    }
    Util.shuffleArrayDestructive(tbl);
    assert(tbl.length >= SharedSettings.EMOTE_BTN_NUM);
    for (let i = 0; i < SharedSettings.EMOTE_BTN_NUM; ++i) {
      const b = new ClientEmote(tbl[i]);
      b.setPos(10+i*48, 1024-48);
      this.emoteButtons.push(b);
    }
    //sort
    this.emoteButtons.sort(function(a,b){ return a.type-b.type;});
  }
  fromJSON(jsonObj: any) {
    if (!jsonObj) return this;
    this.uuid = jsonObj.uuid;
    this.matchState = jsonObj.matchState;
    this.resultState = jsonObj.resultState;
    this.matchTime = jsonObj.matchTime;
    this.miscTime = jsonObj.miscTime;
    //players
    this.players.length = jsonObj.players.length;
    for (let i = 0; i < this.players.length; ++i) {
      if (!this.players[i]) this.players[i] = new ClientMatchSpeedPlayer(i);
      this.players[i].fromJSON(jsonObj.players[i]);
    }
    //layout
    this.layout.length = jsonObj.layout.length;
    for (let i = 0; i < this.layout.length; ++i) {
      if (!this.layout[i]) this.layout[i] = new ClientCard(i);
      this.layout[i].fromJSON(jsonObj.layout[i]);
    }
  }
  isSameMatch(uuid: string): boolean {
    return (this.uuid === uuid);
  }
  isMatchStatePlaying(){
    return (this.matchState == MatchState.Playing);
  }

  myPlayer: ClientMatchSpeedPlayer | null = null;
  dspPlayers: ClientMatchSpeedPlayer[] = [];
  emoteButtons: ClientEmote[] = [];
  update(idstr: string) {
    //clear
    this.myPlayer = null;
    this.dspPlayers.length = 0;
    for (const p of this.players) {
      p.isClientPlayer = false;
    }
    //decide myPlayer
    if (this.players.length === SharedSettings.SPD_PLAYER_NUM) {
      if (this.players[1].isSamePlayer(idstr)) {
        this.myPlayer = this.players[1];
        this.dspPlayers[0] = this.players[1];
        this.dspPlayers[1] = this.players[0];
      } else {
        this.dspPlayers[0] = this.players[0];
        this.dspPlayers[1] = this.players[1];
      }
      if (this.players[0].isSamePlayer(idstr)) {
        this.myPlayer = this.players[0];
      }
      if (this.myPlayer) this.myPlayer.isClientPlayer = true;
    }
    //update layout
    {
      const tmpx = 60; //?????????????????????
      const st = SharedSettings.CANVAS_WIDTH / 2 - tmpx - RenderingSettings.CARD_WIDTH;
      const inc = RenderingSettings.CARD_WIDTH + 2*tmpx;
      const pp = this.getPrimaryPlayer();
      let starndardIndex: number = pp ? pp.index+1 : 1;
      const margin = 80;
      for (let i = 0; i < this.layout.length; ++i) {
        const index = (i + starndardIndex) % this.layout.length;
        const c = this.layout[i];
        if (c) {
          if (index===0) c.setTouchOffset(60,60,60+margin,60);
          else c.setTouchOffset(60,60,60,60+margin);
          c.setBothPos(st + inc * index, (SharedSettings.CANVAS_HEIGHT - RenderingSettings.CARD_HEIGHT) / 2);
        }
      }
    }
    //update players
    for(const p of this.dspPlayers){
      p.update();
    }
    if (this.myPlayer) {
      if (!this.isMatchStatePlaying()) this.myPlayer.clearDragCard();
      this.myPlayer.emitDragInfo();
    }
  }

  regularUpdate(fDeltaTime: number) {
    for (const p of this.players) {
      p.regularUpdate(fDeltaTime);
    }
  }

  getPrimaryPlayer(): ClientMatchSpeedPlayer | null {
    return this.dspPlayers[0];
  }
  getSecondaryPlayer() : ClientMatchSpeedPlayer | null {
    return this.dspPlayers[1];
  }
  getMyPlayer() : ClientMatchSpeedPlayer | null {
    return this.myPlayer;
  }
  isPlaying(): boolean {
    return (this.myPlayer !== null);
  }

  callbackMousedown(posx: number, posy: number) {
    if (this.myPlayer && this.isMatchStatePlaying()) {
      this.myPlayer.callbackMousedown(posx, posy);
    } else {
      this.callbackMouseout();
    }
    if (this.myPlayer && !this.myPlayer.emotes.ignoreInput()) {
      for (const eb of this.emoteButtons) {
        if (eb.pointInRect(posx,posy)) {
          this.myPlayer.emotes.push(eb.type);
          ClientSocket.emitEmote(clientSocket(), eb.type);
          break;
        }
      }
    }
  }
  callbackMouseup(posx: number, posy: number) {
    if (this.myPlayer && this.isMatchStatePlaying()) {
      const dragc = this.myPlayer.getDragCard();
      if (!dragc) return; //drag??????????????????return
      for (let i=0;i< this.layout.length;++i){
        const loc = this.layout[i];
        if (loc.isInvalid()) continue;
        if (loc.pointInRect(posx, posy)) {
          dragc.playACardCnt = this.myPlayer.playACardCnt++; //card?????????????????????
          const d = new PlayACard();
          d.layoutIdx = loc.index;
          d.handIdx = dragc.index;
          d.counter = dragc.playACardCnt;
          ClientSocket.emitPlayACard(clientSocket(), d);
          break;
        }
      }
      this.myPlayer.clearDragCard();
    } else {
      this.callbackMouseout();
    }
  }
  callbackMousemove(posx: number, posy: number) {
    if (this.myPlayer && this.isMatchStatePlaying()) {
      this.myPlayer.callbackMousemove(posx, posy);
    } else {
      this.callbackMouseout();
    }
  }
  callbackMouseout() {
    if (this.myPlayer) {
      this.myPlayer.clearDragCard();
    }
  }
}

export class ClientRoom {
  match: ClientMatchSpeed = new ClientMatchSpeed();
  deleteMatch() {
    this.match = new ClientMatchSpeed();
  }
  fromJSON(jsonObj: any) {
    if (jsonObj.match) {
      if (!this.match.isSameMatch(jsonObj.match.uuid)) {
        this.deleteMatch();
      }
      this.match.fromJSON(jsonObj.match);
    } else {
      this.deleteMatch();
    }
  }
  update(idstr: string) {
    this.match.update(idstr);
  }

  isPlaying(): boolean {
    return this.match.isPlaying();
  }
}
