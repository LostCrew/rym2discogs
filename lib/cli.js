#!/usr/bin/env node
'use strict';

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _app = require('./app');

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_winston2.default.cli();
var args = _yargs2.default.help().usage('Usage: $0 <command> [options]').options({
  file: {
    alias: 'f',
    demand: true,
    describe: 'Path to RateYourMusic export file'
  },
  username: {
    alias: 'u',
    demand: true,
    describe: 'Username on Discogs',
    type: 'string'
  },
  token: {
    alias: 't',
    demand: true,
    describe: 'User token on Discogs',
    type: 'string'
  },
  ownership: {
    alias: 'o',
    default: 'all',
    describe: 'Transfer release based on ownership',
    choices: ['collection', 'wantlist', 'past', 'all']
  },
  debug: {
    alias: 'd',
    describe: 'Debug',
    type: 'boolean'
  }
}).argv;

if (args.debug) {
  _winston2.default.level = 'debug';
  _winston2.default.raw = true;
}
_winston2.default.debug(args);
(0, _app2.default)(args);