'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.filterByOwnership = filterByOwnership;

exports.default = function (options) {
  discogs = new _discogs2.default(options);
  _winston2.default.info("Reading releases from file '%s'…", options.file);
  return (0, _rym.fromFile)(options.file).then(function (releases) {
    return filterByOwnership(releases, options.ownership);
  }).then(function (releases) {
    return releases.slice(0, 50);
  }).then(searchAndAdd).then(function () {
    if (failures.length > 0) {
      _winston2.default.info('Could not add %d releases', failures.length);
      _winston2.default.debug('Failed releases:', failures.map(function (failure) {
        return failure.release.release_title;
      }));
    }
  }).catch(_winston2.default.error.bind(_winston2.default));
};

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _lodash = require('lodash');

var _discogs = require('./discogs');

var _discogs2 = _interopRequireDefault(_discogs);

var _rym = require('./rym');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var failures = [];
var discogs = void 0;

function filterByOwnership(releases) {
  var ownership = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'all';

  var filtered = void 0;
  if (ownership !== 'all') {
    filtered = releases.filter(function (release) {
      return release.ownership === ownership;
    });
    _winston2.default.info("Kept releases with ownership '%s' only (%d)", ownership, filtered.length);
  } else {
    filtered = releases.filter(function (release) {
      return release.ownership === 'collection' || release.ownership === 'wantlist';
    });
    _winston2.default.info("Kept releases with ownership 'collection' and 'wantlist' only (%d)", filtered.length);
  }
  return filtered;
}

function search(release) {
  _winston2.default.info("Searching release '%s'…", release.title);
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
  _winston2.default.info("Adding release '%s' to $s…", release.title, release.ownership);
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
  _winston2.default.info('Searching and add releases (it may take a while)…');
  return _bluebird2.default.map(releases, function (release) {
    return search(release).then(rejectOnNoResults).then(pickResult).then(function (result) {
      return add(result.id, release);
    }).catch(function (error) {
      failures.push({ release: release, error: error });
    });
  });
}