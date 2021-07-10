import assert from 'assert'
import socketio from 'socket.io';
import { Player, BotPlayer } from './Player';
import { MatchSpeed } from './MatchSpeed';
import { nanoid } from 'nanoid';

export class Room {
  constructor(io: socketio.Server) {
    this.io = io;
  }

  io: socketio.Server;
  playersLst: Player[] = [];
  matchSpeed: MatchSpeed | null = null;

  update(fDeltaTime: number) {
    //match削除
    if (this.matchSpeed && this.matchSpeed.needDel) {
      this.matchSpeed.dest();
      this.matchSpeed = null; //削除
    }
    //botの出し入れ
    this.controlBotEntry();
    //match作れたら作る
    this.tryCreateMatchSpeed();
    //match更新
    if(this.matchSpeed){
      this.matchSpeed.update(fDeltaTime);
    }
  }

  postUpdate(){
    if (this.matchSpeed){
      this.matchSpeed.postUpdate();
    }
  }

  createPlayer(strSocketID: string, nickName: string): Player {
    const pl = new Player(strSocketID, nickName);
    this.playersLst.push(pl);
    return pl;
  }

  deletePlayer(player: Player) {
    const index = this.playersLst.findIndex((p) => p === player);
    assert(index >= 0);
    if (index >= 0) {
      this.deleteMatchSpeed(this.playersLst[index]);
      this.playersLst.splice(index, 1);
    }
    console.log('deletePlayer,players length:' + this.playersLst.length);
  }

  private calcBotNum() {
    let ret=0;
    for(const p of this.playersLst){
      if (p.isBot) ++ret;
    }
    return ret;
  }
  private createBotPlayer() {
    this.playersLst.push(new BotPlayer());
  }
  private deleteOneBotPlayer() {
    for(const p of this.playersLst){
      if (p.isBot) {
        this.deletePlayer(p);
        return;
      }
    }
  }
  controlBotEntry() {
    const botNum = this.calcBotNum();
    const playerNum = this.playersLst.length - botNum;
    //playerNum 1の時にbot1 作るだけ
    if (playerNum !== 1) {
      if (botNum > 0) this.deleteOneBotPlayer();
    } else {
      if (botNum > 1) {
        this.deleteOneBotPlayer();
      } else if (botNum === 0) {
        this.createBotPlayer();
      }
    }
  }

  tryCreateMatchSpeed() {
    if (!this.matchSpeed) {
      if (this.playersLst.length >= 2) { //二人必要
        const uuid = nanoid();
        this.matchSpeed = new MatchSpeed(uuid, this.playersLst[0], this.playersLst[1]);
      }
    }
  }

  deleteMatchSpeed(delPlayer: Player) {
    if (this.matchSpeed && this.matchSpeed.isIncluedPlayer(delPlayer)) {
      this.matchSpeed.deleteRequest();
    }
  }

  toJSON() {
    return Object.assign(
      {
        match: this.matchSpeed
      }
    );
  }
}