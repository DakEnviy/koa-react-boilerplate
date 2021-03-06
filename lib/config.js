/* eslint-disable no-process-env, object-shorthand */

const path = require('path');

/**
 * Load .env file (if any)
 * Providing custom props in process.env and sets defaults
 */
require('dotenv').config({ silent: true });

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.HOST = process.env.HOST || 'localhost';
process.env.PORT = process.env.PORT || 3000;

/**
 * Global config
 */

const root = path.normalize(path.join(__dirname, '/..'));

const config = {
  root: root,
  env: process.env.NODE_ENV,
  host: process.env.HOST,
  port: process.env.PORT,

  server: {
    static: { // koa-static-cache
      maxAge: 365 * 24 * 60 * 60,
      gzip: true,
      dynamic: true,
    },

    resolve: { // webpack compat
      ignore: /\.(s?css|less|jpe?g|png|gif|svg|swf|mp[34])$/,
    },
  },

  webpack: {
    resolve: {
      extensions: ['.js', '.jsx', '.scss'],
      alias: {
        // SASS paths aliases (use with ~alias/file)
        assets: path.join(root, 'app', 'assets'),
        scss: path.join(root, 'app', 'scss'),
      },
    },
  },

  client: {
    publicPath: process.env.PUBLIC_PATH || '/',
    gaProperty: process.env.GA_PROPERTY || '',
  },
};

/* istanbul ignore next */
if (config.env === 'development') {
  // use full URL otherwise CSS images break (css-loader bug)
  config.client.publicPath = 'http://' + config.host + ':' + config.port + '/';
}

module.exports = config;
