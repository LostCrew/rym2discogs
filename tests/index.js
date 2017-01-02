import test from 'ava';
import Joi from 'joi';
// import mockFs from 'mock-fs';

import * as rym2discogs from '../src/index';
import { fromFile } from '../src/rym';
import releasesMock from './mocks/releases';


const schema = Joi.object({
  id: Joi.number().integer().positive(),
  title: Joi.string(),
  release_title: Joi.string(),
  artist: Joi.string(),
  year: Joi.number().integer().positive(),
  rating: Joi.number().integer().positive().max(5)
    .multiple(0.5),
  format: Joi.string().allow(''),
  ownership: Joi.string().valid('collection', 'wishlist', 'past', 'none', null),
  note: Joi.string(),
});

test('it should read a CSV file, extract RYM releases and convert them to custom structure', t => {
  fromFile('./mocks/rym-releases.csv')
    .then(releases => {
      t.is(releases.length, 3);
      t.true(releases.every(release => Joi.validate(release, schema, { presence: 'required' })));
    });
});

test('it should filter releases with ownership "past" by default', t => {
  const filtered = rym2discogs.filterByOwnership(releasesMock, 'all');
  t.false(filtered.some(release => release.ownership === 'past'));
});

test('it should filter release by ownership "collection" and "wantlist"', t => {
  const onlyCollection = rym2discogs.filterByOwnership(releasesMock, 'collection');
  const onlyWantlist = rym2discogs.filterByOwnership(releasesMock, 'wantlist');
  t.true(onlyCollection.every(release => release.ownership === 'collection'), 'Collection');
  t.true(onlyWantlist.every(release => release.ownership === 'wantlist'), 'Wantlist');
});
