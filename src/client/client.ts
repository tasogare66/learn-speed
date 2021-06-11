'use strict';

import io from 'socket.io-client';
import { Screen } from './Screen';

const socket = io();

const screen = new Screen();

// キャンバスの描画開始
screen.animate(0);
