# learn-speed
Online speed (card game) with Node.js and Socket.IO sample.

<p align="center">
<img src="./captures/OnlineSpeedPlay.gif" alt="Online speed gameplay." width="428" height="480"></img>
</p>
<p align="center"><a href="https://youtu.be/wpY6ECbxOO4" target="_blank">MOVIE</a></p>
<p align="center"><a href="https://tasogare66.blogspot.com/2021/07/online-speed-card-game-with-nodejs-and.html" target="_blank">BLOG</a></p>
<p align="center"><a href="https://learn-speed.herokuapp.com/" target="_blank">PLAY</a></p>

## Running the sample
```
npm install
node server.js
```

## memo
```
- npm init

entry point server.js
- npm install express --save
- npm install -D @types/express
- npm install socket.io --save
- npm install -D @types/socket.io
- npm install -D @types/socket.io-client
- npm install nanoid --save
- npm install -D @types/nanoid
- npm install jquery --save
- npm install -D @types/jquery

- typescript
- node version v14.15.5
- npm install -D typescript @types/node@14
- npx tsc --init

- compile:npx tsc
- run:node dist/server.js

- webpack
- npm install --save-dev webpack webpack-cli ts-loader html-webpack-plugin webpack-node-externals
npm run dev でwebpack

- nodemon
- npm install --save-dev nodemon nodemon-webpack-plugin
npm run dev でサーバーも起動
```

### HEROKU
```
heroku login
heroku create learn-speed

git push heroku main
heroku ps:scale web=1
heroku open
heroku logs --tail
```
local test
```
heroku local web
```
https://learn-speed.herokuapp.com/

### ref
https://www.hiramine.com/programming/onlinebattletanks_nodejs_socketio/index.html
http://www.cc.kochi-u.ac.jp/~tyamag/jyohou/javascriptcardgame.pdf
