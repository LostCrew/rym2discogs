'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (options) {
  discogs = new _discogs2.default(options);

  _winston2.default.info("Reading releases from file '%s'…", options.file);
  return (0, _rym.fromFile)(options.file).then(function (releases) {
    return releases.map(convertRelease);
  }).then(function (releases) {
    return filterReleasesByOwnership(releases, options.ownership);
  }).then(function (releases) {
    return releases.slice(0, 50);
  }).then(searchAndAddReleases).then(function () {
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

function convertRelease(release) {
  var artist = release['First Name'] ? release['First Name'] + ' ' : release['Last Name'];
  var title = artist + ' - ' + release.Title;
  var format = release['Media Type'];
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

  _winston2.default.debug("Converting RYM release '%s' to Discogs format…", title);
  return {
    id: release['RYM Album'],
    title: title,
    release_title: release.Title,
    artist: artist,
    year: release.Release_Date,
    rating: parseInt(release.Rating / 2, 10),
    format: format,
    ownership: ownership,
    notes: release.Review
  };
}

function filterReleasesByOwnership(releases, ownership) {
  var filteredReleases = releases;
  if (ownership !== 'all') {
    filteredReleases = releases.filter(function (release) {
      return release.ownership === ownership;
    });
    _winston2.default.info("Kept releases with ownership '%s' only (%d)", ownership, filteredReleases.length);
  }
  filteredReleases = releases.filter(function (release) {
    return release.ownership === 'collection' || release.ownership === 'wantlist';
  });
  _winston2.default.info("Kept releases with ownership 'collection' and 'wantlist' only (%d)", filteredReleases.length);
  return filteredReleases;
}

function searchRelease(release) {
  _winston2.default.info("Searching release '%s'…", release.title);
  return discogs.searchRelease((0, _lodash.pick)(release, ['release_title', 'artist'])).then(function (response) {
    _winston2.default.debug(response);return response;
  });
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

function addRelease(id, release) {
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

function searchAndAddRelease(release) {
  return searchRelease(release).then(rejectOnNoResults).then(pickResult).then(function (result) {
    return addRelease(result.id, release);
  }).catch(function (error) {
    failures.push({ release: release, error: error });
  });
}

function searchAndAddReleases(releases) {
  _winston2.default.info('Searching and add releases (it may take a while)…');
  return _bluebird2.default.mapSeries(releases, searchAndAddRelease);
}