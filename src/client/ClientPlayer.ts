import { Socket } from 'socket.io-client';
import { ImgRect, Suit, CardNo, Card, PlayerSerialized, PlayACard } from '../cmn/SerializeData';
import { SharedSettings } from "../cmn/SharedSettings";
import { Util } from '../cmn/Util';
import { clientSocket } from './client';
import { RenderingSettings } from './RenderingSettings';

export class ClientSocket {
  static emitPlayACard(socket: Socket, pac: PlayACard) {
    socket.emit('play-a-card', pac);
  }
}

export class ClientCard extends Card {
  constructor(index: number, suit: Suit = Suit.None, no: CardNo = CardNo.Max) {
    super(suit, no);
    this.index = index;
  }
  rect: ImgRect = { sx: 0, sy: 0, sw: RenderingSettings.CARD_WIDTH, sh: RenderingSettings.CARD_HEIGHT };
  index: number;
  setPos(px: number, py: number) {
    this.rect.sx = px;
    this.rect.sy = py;
  }
  pointInRect(px: number, py: number): boolean {
    return Util.pointInRect(this.rect, px, py);
  }
}

export class ClientMatchSpeedPlayer {
  player = new PlayerSerialized();
  hand: ClientCard[] = [];
  deckLen: number = 0;
  constructor() {
    this.decCard.setPos(30 + 150 * 5, 700);
  }
  fromJSON(jsonObj: any) {
    this.player.fromJSON(jsonObj.player);
    this.hand.length = jsonObj.hand.length;
    for (let i = 0; i < this.hand.length; ++i) {
      if (!this.hand[i]) this.hand[i] = new ClientCard(i);
      this.hand[i].fromJSON(jsonObj.hand[i]);
    }
    this.deckLen = jsonObj.deckLen;
  }
  isSamePlayer(idstr: string) {
    return (this.player.strSocketID === idstr);
  }
  update() {
    this.hand.forEach((c, index) => {
      if (c) c.setPos(30 + 150 * index, 700);
    });
  }

  decCard: ClientCard = new ClientCard(-1);
  dragCard: ClientCard | null = null;
  getDragCard() { return this.dragCard; }
  clearDragCard() { this.dragCard = null; }
  hasDeck(): boolean { return (this.deckLen > 0); }

  callbackMousedown(posx: number, posy: number) {
    //dec判定
    if (this.hasDeck() && this.decCard.pointInRect(posx, posy)) {
      const d = new PlayACard();
      d.setDecToHand();
      ClientSocket.emitPlayACard(clientSocket(), d);
      return;
    }
    //hand判定
    for (const c of this.hand) {
      if (c.isInvalid()) continue;
      if (c.pointInRect(posx, posy)) {
        this.dragCard = c;
        break;
      }
    }
  }
  callbackMousemove(posx: number, posy: number) {
  }
}

export class ClientMatchSpeed {
  uuid: string = "";
  players: ClientMatchSpeedPlayer[] = [];
  layout: ClientCard[] = [];
  fromJSON(jsonObj: any) {
    if (!jsonObj) return this;
    this.uuid = jsonObj.uuid;
    //players
    this.players.length = jsonObj.players.length;
    for (let i = 0; i < this.players.length; ++i) {
      if (!this.players[i]) this.players[i] = new ClientMatchSpeedPlayer();
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

  myPlayer: ClientMatchSpeedPlayer | null = null;
  dspPlayers: ClientMatchSpeedPlayer[] = [];
  update(idstr: string) {
    //clear
    this.myPlayer = null;
    this.dspPlayers.length = 0;
    //decide myPlayer
    if (this.players.length == SharedSettings.SPD_PLAYER_NUM) {
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
    }
    //update
    this.layout.forEach((c,index) => {
      if (c) c.setPos(300 + 150 * index, 512 - 85);
    });
    for(const p of this.dspPlayers){
      p.update();
    }
  }

  getPrimaryPlayer(): ClientMatchSpeedPlayer | null {
    return this.dspPlayers[0];
  }
  getSecondaryPlayer() : ClientMatchSpeedPlayer | null {
    return this.dspPlayers[1];
  }
  isPlaying(): boolean {
    return (this.myPlayer !== null);
  }

  callbackMousedown(posx: number, posy: number) {
    if (this.myPlayer) this.myPlayer.callbackMousedown(posx, posy);
  }
  callbackMouseup(posx: number, posy: number) {
    if (this.myPlayer) {
      const dragc = this.myPlayer.getDragCard();
      if (!dragc) return; //dragしてない場合return
      for (let i=0;i< this.layout.length;++i){
        const loc = this.layout[i];
        if (loc.isInvalid()) continue;
        if (loc.pointInRect(posx, posy)) {
          const d = new PlayACard();
          d.layoutIdx = loc.index;
          d.handIdx= dragc.index;
          ClientSocket.emitPlayACard(clientSocket(), d);
          break;
        }
      }
      this.myPlayer.clearDragCard();
    }
  }
  callbackMousemove(posx: number, posy: number) {
    if (this.myPlayer) this.myPlayer.callbackMousemove(posx, posy);
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
