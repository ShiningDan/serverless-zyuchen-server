'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1528014930504_4680';

  // add your config here
  config.middleware = [];

  config.mongoose = {
    url: 'ds251548.mlab.com:51548/zyuchen',
    options: {
      user: 'zyuchen',
      pass: 'zyuchen-mongo',
    },
  };

  config.cors = {
    origin: 'http://localhost:3000',
  };

  return config;
};
