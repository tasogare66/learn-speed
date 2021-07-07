# learn-speed

## Running the sample
- npm install
- node server.js

## memo
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

## ref
http://www.cc.kochi-u.ac.jp/~tyamag/jyohou/javascriptcardgame.pdf

## HEROKU
- heroku login
- heroku create learn-speed

- git push heroku main
- heroku ps:scale web=1
- heroku open
- heroku logs --tail

local test
- heroku local web