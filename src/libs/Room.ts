import { assert } from 'console';
import socketio from 'socket.io';
import { Player } from './Player';
import { MatchSpeed } from './MatchSpeed';

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
    //match作れたら作る
    this.tryCreateMatchSpeed();
    //match更新
    if(this.matchSpeed){
      this.matchSpeed.update(fDeltaTime);
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

  tryCreateMatchSpeed() {
    if (!this.matchSpeed) {
      if (this.playersLst.length >= 2) { //二人必要
        this.matchSpeed = new MatchSpeed(this.playersLst[0], this.playersLst[1]);
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