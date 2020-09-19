const WebpackPwaManifest = require("webpack-pwa-manifest");
const path = require("path");

const config = {
  mode: "development",

  entry: {
    app: "./index.js"
  },

  output: {
    path: __dirname + "/dist",
    filename: "bundle.js"
  },

  plugins: [
    new WebpackPwaManifest({
      fingerprints: false,
      name: "Budget Tracker",
      short_name: "Budget Tracker",
      description: "An application that allows users to track expenses and deposits online/offline. Transactions entered offline will be calculated and populated when a connection is established",
      background_color: "#01579b",
      theme_color: "#ffffff",
      start_url: "/",
      icons: [{
        src: path.resolve("icons/icon-192x192.png"),
        sizes: [96, 128, 192, 256, 384, 512],
        destination: path.join("assets", "icons")
      }]
    })
  ],

  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      }
    ]
  }
};

module.exports = config;
