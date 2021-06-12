'use strict';

import { io, Socket } from 'socket.io-client';
import { Screen } from './Screen';

const socket: Socket = io();

const screen = new Screen(socket);

// キャンバスの描画開始
screen.animate(0);
