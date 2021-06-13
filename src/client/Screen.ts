import { io, Socket } from 'socket.io-client';
import { SharedSettings } from './SharedSettings';
import { RenderingSettings } from './RenderingSettings';
import { Assets } from './Assets';

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
  players: any[] = [];
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
      (players, iProcessingTimeNanoSec) => {
        this.players = players;
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

    if (this.players) {
      //FIXME:  
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
}
