import Promise from 'bluebird';
// import winston from 'winston';
import { pick } from 'lodash';

import Discogs from './discogs';
import { fromFile } from './rym';

const failures = [];
let discogs;


function search(release) {
  // winston.info("Searching release '%s'…", release.title);
  return discogs.searchRelease(pick(release, ['release_title', 'artist']));
}

function rejectOnNoResults(response) {
  if (response.pagination.items === 0) {
    return Promise.reject('not-found');
  }
  return response;
}

function pickResult(response) {
  return response.results[0];
}

function add(id, release) {
  // winston.info("Adding release '%s' to $s…", release.title, release.ownership);
  let method;
  if (release.ownership === 'collection') {
    method = 'addCollectionRelease';
  }
  if (release.ownership === 'wantlist') {
    method = 'addWantlistRelease';
  }
  return discogs[method](id, pick(release, ['rating', 'notes']));
}

function searchAndAdd(releases) {
  // winston.info('Searching and add releases (it may take a while)…');
  return Promise.map(releases, release => search(release)
    .then(rejectOnNoResults)
    .then(pickResult)
    .then(result => add(result.id, release))
    .then(() => release)
    .catch(error => { failures.push({ release, error }); }));
}


export default function (optiosn) {
  // winston.info("Reading releases from file '%s'…", options.file);
  return fromFile(file)
    .then(releases => filterByOwnership(releases, options.ownership))
    .then(searchAndAdd)
    .then(() => {
      if (failures.length > 0) {
        // winston.info('Could not add %d releases', failures.length);
        // winston.debug('Failed releases:', failures.map(failure => failure.release.release_title));
      }
      return { failures };
    })
    // .catch(winston.error.bind(winston));
}
