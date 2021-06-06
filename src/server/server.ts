'user strict';

import express from 'express';
import http from 'http';
import socketio from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new socketio.Server(server);

//公開フォルダ
app.use(express.static(/*__dirname +*/'public'));

//サーバーの起動
const PORT_NO = process.env.PORT || 1337; //ポート番号
server.listen(
  PORT_NO,
  () => {
    console.log('Starting server on port %d', PORT_NO);
  }
);
