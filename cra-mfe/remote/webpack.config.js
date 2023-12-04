const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const packageJson = require('./package.json');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
 
module.exports = {
 entry: "./src/index",
 mode: "development",
 devServer: {
   static: {
     directory: path.join(__dirname, "public"),
   },
   port: 4000,
 },
 module: {
   rules: [
     {
       test: /\.(js|jsx)?$/,
       exclude: /node_modules/,
       use: [
         {
           loader: "babel-loader",
           options: {
             presets: ["@babel/preset-env", "@babel/preset-react"],
           },
         },
       ],
     },
     {
       test: /\.css$/i,
       use: ["style-loader", "css-loader"],
     },
     {
       test: /\.(gif|png|jpe?g|svg)$/,
       use: [
         {
           loader: "file-loader",
           options: {
             name: "[name].[ext]",
             outputPath: "assets/images/",
           },
         },
       ],
     },
   ],
 },
 plugins: [
   new HtmlWebpackPlugin({
     template: "./public/index.html",
     favicon: "./public/favicon.ico",
     manifest: "./public/manifest.json",
   }),
   new ModuleFederationPlugin({
   name: "Remote",
   filename: "remoteEntry.js",
   exposes: {
     "./App": "./src/App",
     "./Button": "./src/Button",
   },
   shared: packageJson.dependencies,
   })
 ],
 resolve: {
   extensions: [".js", ".jsx"],
 },
 target: "web",
};