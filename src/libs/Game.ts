import socketio from 'socket.io';
import { GameSettings } from '../libs/GameSettings';
import { Room } from '../libs/Room';
import { Player } from '../libs/Player';
import { PlayACard } from '../cmn/SerializeData';

export class Game{
  constructor(){}

  start(io: socketio.Server) {
    const room = new Room(io);
    let iTimeLast = Date.now();

    //接続時の処理
    io.on('connection', (socket: socketio.Socket) => {
      console.log('connection : socket.id = %s', socket.id);
      let player: Player | null = null;

      socket.on('enter-the-game',
        (objConfig) => {
          console.log('enter-the-game : socket.id=%s', socket.id);
          player = room.createPlayer(socket.id, objConfig.nickName);
        }
      );

      //切断時の処理の指定
      //・クライアントが切断したら、サーバー側では'disconnect'イベントが発生する
      socket.on('disconnect', () => {
        console.log('disconnect : socket.id = %s', socket.id);
        if (!player) return;
        room.deletePlayer(player);
        player = null;
      });

      socket.on('play-a-card', (pac) => {
        if (!player || !player.isDuringTheGame) return;
        player.pushPlayACard(new PlayACard().fromJSON(pac));
      });
    });

    setInterval(() => {
      //経過時間
      const iTimeCurrent = Date.now(); //msec
      const fDeltaTime = (iTimeCurrent - iTimeLast) * 0.001; //sec
      iTimeLast = iTimeCurrent;

      const hrtime = process.hrtime();
      {
        //roomの更新
        room.update(fDeltaTime);
      }
      const hrtimeDiff = process.hrtime(hrtime);

      const iNanosecDiff = hrtimeDiff[0] * 1e9 + hrtimeDiff[1];
      //clientに送信
      io.emit('update',
        room,
        iNanosecDiff
      );
    }, 1000 / GameSettings.FRAMERATE); //1000(ms)/FRAMERATE(30)
  }
}