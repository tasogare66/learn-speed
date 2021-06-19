import { Socket } from 'socket.io-client';
import { SharedSettings } from '../cmn/SharedSettings';
import { RenderingSettings } from './RenderingSettings';
import { ImgRect, Assets } from './Assets';
import { Card, RoomSerialized, MatchSpeedPlayerSerialized, PlayACard } from '../cmn/SerializeData';
import { Util } from '../cmn/Util';

export class Screen{
  constructor(socket: Socket, canvas: HTMLCanvasElement) {
    this.socket = socket;
    this.canvas = canvas;
    this.context = canvas.getContext('2d')!; //non-null

    this.assets = new Assets();

    //キャンバスの初期化
    this.canvas.width = SharedSettings.FIELD_WIDTH;
    this.canvas.height = SharedSettings.FIELD_HEIGHT;

    this.initSocket();
 
    //コンテキストの初期化
    this.context.imageSmoothingEnabled = false;
  }

  socket: Socket;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  assets: Assets;
  room: RoomSerialized = new RoomSerialized();
  iProcessingTimeNanoSec = 0;

  //socketの初期化
  initSocket(){
    // 接続確立時の処理
    // ・サーバーとクライアントの接続が確立すると、
    // 　サーバーで、'connection'イベント
    // 　クライアントで、'connect'イベントが発生する
    this.socket.on(
      'connect',
      () => {
        console.log('connect : socket.id = %s', this.socket.id);
        // サーバーに'enter-the-game'を送信
        this.socket.emit('enter-the-game');
      });

    // サーバーからの状態通知に対する処理
    // ・サーバー側の周期的処理の「io.sockets.emit( 'update', ・・・ );」に対する処理
    this.socket.on(
      'update',
      (room, iProcessingTimeNanoSec) => {
        this.room = new RoomSerialized().fromJSON(room);
        this.iProcessingTimeNanoSec = iProcessingTimeNanoSec;
      });
  }

  animate(iTimeCurrent: number)
  {
    requestAnimationFrame((iTimeCurrent)=>{
      this.animate(iTimeCurrent);
    });
    this.render(iTimeCurrent);
  }

  render(iTimeCurrent: number)
  {
    //console.log('render:'+iTimeCurrent+' : '+this.iProcessingTimeNanoSec);

    //clear
    this.context.clearRect(0,0, this.canvas.width, this.canvas.height);

    //bg
    this.renderField();

    if (this.room) {
      this.renderRoom();
    }

    //枠の描画
    this.context.save();
    {
      this.context.strokeStyle = RenderingSettings.FIELD_LINECOLOR;
      this.context.lineWidth = RenderingSettings.FIELD_LINEWIDTH;
      this.context.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.context.restore();

    //server処理時間表示
    this.context.save();
    {
      this.context.font = RenderingSettings.PROCESSINGTIME_FONT;
      this.context.fillStyle = RenderingSettings.PROCESSINGTIME_COLOR;
      this.context.fillText((this.iProcessingTimeNanoSec * 1e-9).toFixed(9) + ' [s]',
        this.canvas.width - 30 * 10, 40);
    }
    this.context.restore();
  }

  renderField()
  {
    this.context.save();
    {
      const iCountX = Math.floor(SharedSettings.FIELD_WIDTH / RenderingSettings.FIELDTILE_WIDTH);
      const iCountY = Math.floor(SharedSettings.FIELD_HEIGHT / RenderingSettings.FIELDTILE_HEIGHT);
      for (let iIndexY = 0; iIndexY < iCountY; iIndexY++) {
        for (let iIndexX = 0; iIndexX < iCountX; iIndexX++) {
          this.context.drawImage(this.assets.imageField,
            this.assets.rectFieldInFieldImage.sx, this.assets.rectFieldInFieldImage.sy,	// 描画元画像の右上座標
            this.assets.rectFieldInFieldImage.sw, this.assets.rectFieldInFieldImage.sh,	// 描画元画像の大きさ
            iIndexX * RenderingSettings.FIELDTILE_WIDTH,// 画像先領域の右上座標（領域中心が、原点になるように指定する）
            iIndexY * RenderingSettings.FIELDTILE_HEIGHT,// 画像先領域の右上座標（領域中心が、原点になるように指定する）
            RenderingSettings.FIELDTILE_WIDTH,	// 描画先領域の大きさ
            RenderingSettings.FIELDTILE_HEIGHT);	// 描画先領域の大きさ
        }
      }
    }
    this.context.restore();
  }

  renderRoom()
  {
    this.renderMatchSpeed();
  }

  renderMatchSpeed()
  {
    const match = this.room.match;
    if (!match) {
      return;
    }

    this.renderLayout();
    this.renderPlayers();
  }

  renderLayout()
  {
    this.context.save();
    {
      this.room.match.layout.forEach((c,index) => {
        if (c) {
          this.renderCard(c, 300 + 150 * index, 512 - 85);
        }
      });
    }
    this.context.restore();
  }

  renderPlayers()
  {
    if (!this.room.match.players) return;

    const eachPls = this.room.match.getEachPlayers(this.socket.id);
    if (!eachPls) return;

    this.context.save();
    {
      this.renderPlayer(eachPls.my);
    }
    this.context.restore();

    this.context.save();
    {
      this.context.translate(this.canvas.width/2, this.canvas.height/2);
      this.context.rotate(Math.PI);
      this.context.translate(-this.canvas.width/2, -this.canvas.height/2);
      this.renderPlayer(eachPls.opponent);
    }
    this.context.restore();
  }
  renderPlayer(player: MatchSpeedPlayerSerialized)
  {
    const h1 = player?.hand!;
    if (h1) {
      //手札描画
      h1.forEach((c, index) => {
        this.renderCard(c, 30 + 150 * index, 700);
      });
      //deck
      this.renderCardBack(30 + 150 * 5, 700);
    }
  }

  renderCard(c: Card, px: number, py: number)
  {
    if (c.isInvalid()) return;

    this.context.save();
    {
      const rect = this.assets.getCardImgRect(c);
      this.context.drawImage(this.assets.imgCards,
        rect.sx, rect.sy,	// 描画元画像の右上座標
        rect.sw, rect.sh,	// 描画元画像の大きさ
        px,	// 画像先領域の右上座標（領域中心が、原点になるように指定する）
        py,	// 画像先領域の右上座標（領域中心が、原点になるように指定する）
        rect.sw,	// 描画先領域の大きさ
        rect.sh);	// 描画先領域の大きさ
    }
    this.context.restore();
  }

  renderCardBack(px: number, py: number)
  {
    this.context.save();
    {
      const rect = this.assets.getCardBackImgRect();
      this.context.drawImage(this.assets.imgCardBack,
        rect.sx, rect.sy,	// 描画元画像の右上座標
        rect.sw, rect.sh,	// 描画元画像の大きさ
        px,	// 画像先領域の右上座標（領域中心が、原点になるように指定する）
        py,	// 画像先領域の右上座標（領域中心が、原点になるように指定する）
        rect.sw,	// 描画先領域の大きさ
        rect.sh);	// 描画先領域の大きさ
    }
    this.context.restore();
  }

  emitPlayACard(pac: PlayACard) {
    this.socket.emit('play-a-card', pac);
  }
  callbackKeydown(e:KeyboardEvent) {
    //FIXME:自分がplay中だった送る  
    if (!e.repeat){
      const d = new PlayACard();
      //dec to hand
      if (e.code==='Space') {
        d.setDecToHand();
        this.emitPlayACard(d);
        return;
      }
      //hand to layout
      switch (e.code) {
        case 'KeyZ':
        case 'KeyA':
          d.handIdx = 0;
          break;
        case 'KeyX':
        case 'KeyS':
          d.handIdx = 1;
          break;
        case 'KeyC':
        case 'KeyD':
          d.handIdx = 2;
          break;
        case 'KeyV':
        case 'KeyF':
          d.handIdx = 3;
          break;
      }
      switch (e.code) {
        case 'KeyZ':
        case 'KeyX':
        case 'KeyC':
        case 'KeyV':
          d.layoutIdx = 1;
          break;
        case 'KeyA':
        case 'KeyS':
        case 'KeyD':
        case 'KeyF':
          d.layoutIdx = 0;
          break;
      }
      if (d.isValidHand()) {
        this.emitPlayACard(d);
        return;
      }
    }
  }
}
