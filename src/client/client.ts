'use strict';

import { io, Socket } from 'socket.io-client';
import { Screen } from './Screen';

const socket: Socket = io();

const canvas = <HTMLCanvasElement>document.querySelector('#canvas-2d');

const screen = new Screen(socket, canvas);

// キャンバスの描画開始
screen.animate(0);
