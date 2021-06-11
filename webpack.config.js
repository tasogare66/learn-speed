const nodeExternals = require("webpack-node-externals");

module.exports = [{
  // ブラウザで動く機能をバンドル
  mode: "development",
  entry: {
    client: "./src/client/client.ts",
  },
  output: {
    filename: "[name].js",
    // expressでpublicフォルダ配下を静的に読む込むように設定するので、そこに出力する
    path: `${__dirname}/public/js`,
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: "ts-loader",
      exclude: /node_modules/,
    }]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
}, {
  // Nodeサーバーで動く機能をバンドル
  mode: "development",
  entry: {
    server: "./src/server/server.ts",
  },
  target: "node",
  node: {
    // expressを使うときにはこの設定をしないと失敗します
    // 参考：https://medium.com/@binyamin/creating-a-node-express-webpack-app-with-dev-and-prod-builds-a4962ce51334
    __dirname: false,
    __filename: false,
  },
  externals: [nodeExternals()],
  module: {
    rules: [{
      test: /\.ts$/,
      use: "ts-loader",
      exclude: /node_modules/,
    }]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
}];