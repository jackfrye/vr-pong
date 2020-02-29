var path = require('path');
var fs = require('fs');

module.exports = {
  mode: 'development',
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'app.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname),
    pfx: '/home/jfrye/cert.pfx',
    pfxPassphrase: 'password',
    port: '12345',
    host: '0.0.0.0'
  }
};
