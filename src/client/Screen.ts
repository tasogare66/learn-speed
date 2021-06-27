import { Socket } from 'socket.io-client';
import { SharedSettings } from '../cmn/SharedSettings';
import { RenderingSettings } from './RenderingSettings';
import { Assets } from './Assets';
import { Vec2f, PlayACard, ImgRect, MatchState } from '../cmn/SerializeData';
import { ClientRoom, ClientMatchSpeedPlayer, ClientCard } from './ClientPlayer';

export class Screen{
  constructor(socket: Socket, canvas: HTMLCanvasElement) {
    this.socket = socket;
    this.canvas = canvas;
    this.context = canvas.getContext('2d')!; //non-null

    this.assets = new Assets();

    //キャンバスの初期化
    this.canvas.width = SharedSettings.CANVAS_WIDTH;
    this.canvas.height = SharedSettings.CANVAS_HEIGHT;

    this.initSocket();

    //コンテキストの初期化
    this.context.imageSmoothingEnabled = false;
  }

  socket: Socket;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  assets: Assets;
  room = new ClientRoom();
  iProcessingTimeNanoSec = 0;
  debugDisp: boolean = false;

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
        this.iProcessingTimeNanoSec = iProcessingTimeNanoSec;
        this.room.fromJSON(room);
        this.room.update(this.socket.id);
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

    this.renderRoom();

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

    if (this.debugDisp) this.renderDebug();
  }

  renderField()
  {
    this.context.save();
    {
      const iCountX = Math.floor(SharedSettings.CANVAS_WIDTH / RenderingSettings.FIELDTILE_WIDTH);
      const iCountY = Math.floor(SharedSettings.CANVAS_HEIGHT / RenderingSettings.FIELDTILE_HEIGHT);
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

  private renderMatchTime(matchtm: number) {
    this.context.save();
    {
      this.context.font = RenderingSettings.PROCESSINGTIME_FONT;
      this.context.fillStyle = RenderingSettings.PROCESSINGTIME_COLOR;
      this.context.fillText((matchtm).toFixed(9) + ' [s]',
        this.canvas.width - 30 * 10, 80);
    }
    this.context.restore();
  }

  private renderMiscTime(misctm: number) {
    this.context.save();
    {
      this.context.font = RenderingSettings.PROCESSINGTIME_FONT;
      this.context.fillStyle = RenderingSettings.PROCESSINGTIME_COLOR;
      this.context.fillText((misctm).toFixed(9) + ' [s]',
        this.canvas.width/2, this.canvas.height/2);
    }
    this.context.restore();
  }

  renderMatchSpeed()
  {
    const match = this.room.match;
    if (!match) {
      return;
    }

    this.renderLayout();
    this.renderPlayers();

    this.renderMatchTime(match.matchTime);
    switch (match.matchState){
      case MatchState.StartWait:
      case MatchState.PutLayoutWait:
        this.renderMiscTime(match.miscTime);
        break;
      case MatchState.Finished:
        break;
    }
  }

  renderLayout()
  {
    this.context.save();
    {
      this.room.match.layout.forEach((c,index) => {
        if (c) {
          this.renderCard(c);
        }
      });
    }
    this.context.restore();
  }

  renderPlayers()
  {
    if (!this.room.match.players) return;

    this.context.save();
    {
      this.context.translate(this.canvas.width/2, this.canvas.height/2);
      this.context.rotate(Math.PI);
      this.context.translate(-this.canvas.width/2, -this.canvas.height/2);
      this.renderPlayer(this.room.match.getSecondaryPlayer());
    }
    this.context.restore();

    this.context.save();
    {
      this.renderPlayer(this.room.match.getPrimaryPlayer());
      this.renderMyPlayer(this.room.match.getMyPlayer());
    }
    this.context.restore();
  }
  renderPlayer(player: ClientMatchSpeedPlayer | null)
  {
    if (!player) return;
    const h1 = player?.hand!;
    if (h1) {
      //deck
      if (player.hasDeck()) {
        const dc = player.decCard;
        this.renderCardBack(dc);
      }
      //手札描画
      h1.forEach((c, index) => {
        if (c !== player.dragCard) this.renderCard(c);
      });
      if (player.dragCard) {
        this.renderCard(player.dragCard);
      }
    }
  }
  renderMyPlayer(player: ClientMatchSpeedPlayer | null)
  {
    if (player) {
      this.drawCircle(player.mousePos.x, player.mousePos.y, 10);
    }
  }

  renderCard(c: ClientCard)
  {
    if (c.isInvalid()) return;

    this.context.save();
    {
      const rect = this.assets.getCardImgRect(c);
      this.context.drawImage(this.assets.imgCards,
        rect.sx, rect.sy,	// 描画元画像の右上座標
        rect.sw, rect.sh,	// 描画元画像の大きさ
        c.rect.sx,	// 画像先領域の右上座標（領域中心が、原点になるように指定する）
        c.rect.sy,	// 画像先領域の右上座標（領域中心が、原点になるように指定する）
        c.rect.sw,	// 描画先領域の大きさ
        c.rect.sh);	// 描画先領域の大きさ
      if (this.debugDisp) this.drawRect(c.touchRect); //for debug
    }
    this.context.restore();
  }

  renderCardBack(c: ClientCard)
  {
    this.context.save();
    {
      const rect = this.assets.getCardBackImgRect();
      this.context.drawImage(this.assets.imgCardBack,
        rect.sx, rect.sy,	// 描画元画像の右上座標
        rect.sw, rect.sh,	// 描画元画像の大きさ
        c.rect.sx,	// 画像先領域の右上座標（領域中心が、原点になるように指定する）
        c.rect.sy,	// 画像先領域の右上座標（領域中心が、原点になるように指定する）
        rect.sw,	// 描画先領域の大きさ
        rect.sh);	// 描画先領域の大きさ
      if (this.debugDisp) this.drawRect(c.touchRect); //for debug
    }
    this.context.restore();
  }

  isPlaying(): boolean {
    return this.room.isPlaying();
  }

  emitPlayACard(pac: PlayACard) {
    this.socket.emit('play-a-card', pac);
  }

  drawLine(st:Vec2f, ed:Vec2f) {
    this.context.beginPath();
    this.context.moveTo(st.x, st.y);
    this.context.lineTo(ed.x, ed.y);
    this.context.stroke();
  }
  drawRect(rect: ImgRect) {
    this.context.strokeStyle = 'blue';
    this.context.strokeRect(rect.sx, rect.sy, rect.sw, rect.sh);
  }
  drawCircle(cx: number, cy: number, radius: number) {
    this.context.beginPath();
    this.context.arc(cx, cy, radius, 0, 2 * Math.PI);
    this.context.stroke()        
  }

  //for debug
  renderDebug(){
    this.context.save();
    {
      this.drawLine({ x: SharedSettings.CANVAS_WIDTH / 2, y: 0 }, { x: SharedSettings.CANVAS_WIDTH / 2, y: SharedSettings.CANVAS_HEIGHT });
      this.drawLine({ x: 0, y: SharedSettings.CANVAS_HEIGHT/2 }, { x: SharedSettings.CANVAS_WIDTH, y: SharedSettings.CANVAS_HEIGHT/2 });
    }
    this.context.restore();
  }

  callbackKeydown(e:KeyboardEvent) {
    if (!this.isPlaying()) return;
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

  static getCanvasPosition(tgt: HTMLCanvasElement, x: number, y: number): Vec2f {
    const rect = tgt.getBoundingClientRect();
    // ブラウザ上
    const viewX = x - rect.left;
    const viewY = y - rect.top;
    // 表示サイズとキャンバスの実サイズの比率を求める
    const scaleWidth = tgt.clientWidth / tgt.width;
    const scaleHeight = tgt.clientHeight / tgt.height;
    const scale = Math.min(scaleWidth, scaleHeight);
    const rectsize = Math.min(rect.width, rect.height);
    // キャンバス座標
    return { x: (viewX - (rect.width - rectsize) / 2) / scale, y: (viewY - (rect.height - rectsize) / 2) / scale };
  }

  callbackMousedown(e: MouseEvent) {
    const pos = Screen.getCanvasPosition(this.canvas, e.clientX, e.clientY);
    this.room.match.callbackMousedown(pos.x, pos.y);
  }
  callbackMouseup(e: MouseEvent) {
    const pos = Screen.getCanvasPosition(this.canvas, e.clientX, e.clientY);
    this.room.match.callbackMouseup(pos.x, pos.y);
  }
  callbackMousemove(e: MouseEvent) {
    const pos = Screen.getCanvasPosition(this.canvas, e.clientX, e.clientY);
    this.room.match.callbackMousemove(pos.x, pos.y);
  }
}
