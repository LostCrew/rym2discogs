import Promise from 'bluebird';
import winston from 'winston';
import { pick } from 'lodash';

import Discogs from './discogs';
import { fromFile } from './rym';

let discogs;


function search(release) {
  winston.verbose("Searching release '%s'…", release.title);
  return discogs.searchRelease(pick(release, ['release_title', 'artist']));
}

function add(id, release) {
  winston.verbose("Adding release '%s' to $s…", release.title, release.ownership);
  let method;
  if (release.ownership === 'collection') {
    method = 'addCollectionRelease';
  }
  if (release.ownership === 'wantlist') {
    method = 'addWantlistRelease';
  }
  const options = pick(release, ['rating', 'notes']);
  return discogs[method](id, options);
}

export function filterByOwnership(releases, ownership = 'all') {
  if (ownership !== 'all') {
    return releases.filter(release => release.ownership === ownership);
  }
  return releases.filter(release => (
    release.ownership === 'collection' ||
    release.ownership === 'wantlist'
  ));
}

async function searchAndAdd(release) {
  winston.verbose('Searching and add releases (it may take a while)…');
  const response = await search(release);
  if (response.pagination.items === 0) {
    return Promise.resolve({ release, error: 'not-found' });
  }
  const result = response.results[0];
  await add(result.id, release);
  return Promise.resolve({ release, error: null });
}

export default async function (options) {
  winston.verbose("Reading releases from file '%s'…", options.file);
  discogs = new Discogs(options);
  const releases = await fromFile(options.file);
  const filteredReleased = filterByOwnership(releases, options.ownership);
  const results = await Promise.map(filteredReleased, searchAndAdd);
  return Promise.resolve({
    success: results.filter(result => !result.error),
    error: results.filter(result => result.error),
  });
}
