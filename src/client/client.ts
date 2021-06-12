'use strict';

import { io, Socket } from 'socket.io-client';
import { Screen } from './Screen';

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