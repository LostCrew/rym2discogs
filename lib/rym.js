'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fromFile = fromFile;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _fs = require('fs');

var _csvParse = require('csv-parse');

var _csvParse2 = _interopRequireDefault(_csvParse);

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import winston from 'winston';


var readFilePromise = _bluebird2.default.promisify(_fs.readFile);
var parseCsv = _bluebird2.default.promisify(_csvParse2.default);
var schema = _joi2.default.object({
  'RYM Album': _joi2.default.number().integer().positive(),
  Title: _joi2.default.string(),
  Release_Date: _joi2.default.number().integer().positive(),
  Rating: _joi2.default.number().integer().positive().max(5).multiple(0.5),
  Ownership: _joi2.default.string(),
  'Media Type': _joi2.default.string().allow(''),
  Review: _joi2.default.string().allow('')
});

function validate(release) {
  return _joi2.default.validate(schema, release, { presence: 'required' });
}

function convert(release) {
  var artist = release['First Name'] ? release['First Name'] + ' ' : release['Last Name'];
  var title = artist + ' - ' + release.Title;
  var ownership = null;

  switch (release.Ownership) {
    case 'o':
      ownership = 'collection';
      break;
    case 'w':
      ownership = 'wantlist';
      break;
    case 'u':
      ownership = 'past';
      break;
    case 'n':
      ownership = 'none';
      break;
    default:
      ownership = null;
  }

  // winston.debug("Converting RYM release '%s' to Discogs format…", title);
  return {
    id: release['RYM Album'],
    title: title,
    release_title: release.Title,
    artist: artist,
    year: release.Release_Date,
    rating: parseFloat(release.Rating / 2),
    format: release['Media Type'],
    ownership: ownership,
    notes: release.Review
  };
}

// eslint-disable-next-line import/prefer-default-export
function fromFile(file) {
  return readFilePromise(file, 'utf8').then(function (csv) {
    return parseCsv(csv, { columns: true });
  }).then(function (releases) {
    return releases.map(validate).map(convert);
  });
  // .then(releases => {
  // winston.info('Found %d releases', releases.length);
  // return releases;
  // });
}