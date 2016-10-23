'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.filterByOwnership = filterByOwnership;

exports.default = function (options) {
  // winston.info("Reading releases from file '%s'…", options.file);
  discogs = new _discogs2.default(options);
  return (0, _rym.fromFile)(options.file).then(function (releases) {
    return filterByOwnership(releases, options.ownership);
  }).then(searchAndAdd).then(function () {
    if (failures.length > 0) {
      // winston.info('Could not add %d releases', failures.length);
      // winston.debug(
      //   'Failed releases:',
      //   failures.map(failure => failure.release.release_title)
      // );
    }
    return { failures: failures };
  });
  // .catch(winston.error.bind(winston));
};

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _lodash = require('lodash');

var _discogs = require('./discogs');

var _discogs2 = _interopRequireDefault(_discogs);

var _rym = require('./rym');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var failures = [];
// import winston from 'winston';

var discogs = void 0;

function search(release) {
  // winston.info("Searching release '%s'…", release.title);
  return discogs.searchRelease((0, _lodash.pick)(release, ['release_title', 'artist']));
}

function rejectOnNoResults(response) {
  if (response.pagination.items === 0) {
    return _bluebird2.default.reject('not-found');
  }
  return response;
}

function pickResult(response) {
  return response.results[0];
}

function add(id, release) {
  // winston.info("Adding release '%s' to $s…", release.title, release.ownership);
  var method = void 0;
  if (release.ownership === 'collection') {
    method = 'addCollectionRelease';
  }
  if (release.ownership === 'wantlist') {
    method = 'addWantlistRelease';
  }
  return discogs[method](id, (0, _lodash.pick)(release, ['rating', 'notes']));
}

function searchAndAdd(releases) {
  // winston.info('Searching and add releases (it may take a while)…');
  return _bluebird2.default.map(releases, function (release) {
    return search(release).then(rejectOnNoResults).then(pickResult).then(function (result) {
      return add(result.id, release);
    }).then(function () {
      return release;
    }).catch(function (error) {
      failures.push({ release: release, error: error });
    });
  });
}

function filterByOwnership(releases) {
  var ownership = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'all';

  if (ownership !== 'all') {
    return releases.filter(function (release) {
      return release.ownership === ownership;
    });
  }
  return releases.filter(function (release) {
    return release.ownership === 'collection' || release.ownership === 'wantlist';
  });
}