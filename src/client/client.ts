'use strict';

import { io, Socket } from 'socket.io-client';
import $ from 'jquery';
import { Screen } from './Screen';
import { Assets } from './Assets';

const socket: Socket = io();

const canvas = <HTMLCanvasElement>document.querySelector('#canvas-2d');

const screen = new Screen(socket, canvas);

// キャンバスの描画開始
screen.animate(0);

window.addEventListener('beforeunload', function (e) {
  socket.disconnect();
  //Chrome では returnValue を設定する必要がある
  e.returnValue = '';
});

document.addEventListener('keydown', (e) => { screen.callbackKeydown(e); });
document.getElementById('start-button')?.addEventListener('click', (e) => {
  const objConfig = { nickName: $('#nickname').val() };
  socket.emit('enter-the-game', objConfig);
  startScreenDisp(false);
});
canvas.addEventListener('mousedown', (e) => { screen.callbackMousedown(e); });
canvas.addEventListener('mouseup', (e) => { screen.callbackMouseup(e); });
canvas.addEventListener('mousemove', (e) => { screen.callbackMousemove(e); });
canvas.addEventListener('mouseout', (e) => { screen.callbackMouseout(e); });
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); screen.callbackTouchstart(e); });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); screen.callbackTouchmove(e); });
canvas.addEventListener('touchend', (e) => { e.preventDefault(); screen.callbackTouchend(e); });

export function clientSocket(): Socket {
  return socket;
}
export function clientAssets(): Assets {
  return screen.assets;
}

export function startScreenDisp(flag:boolean){
  if (flag) {
    $('#start-screen').show();
  } else {
    $('#start-screen').hide();
  }
}
