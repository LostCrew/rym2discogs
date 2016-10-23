import Promise from 'bluebird';
import { readFile } from 'fs';
import csvParse from 'csv-parse';
import Joi from 'joi';
// import winston from 'winston';


const readFilePromise = Promise.promisify(readFile);
const parseCsv = Promise.promisify(csvParse);
const schema = Joi.object({
  'RYM Album': Joi.number().integer().positive(),
  Title: Joi.string(),
  Release_Date: Joi.number().integer().positive(),
  Rating: Joi.number().integer().positive().max(5)
    .multiple(0.5),
  Ownership: Joi.string(),
  'Media Type': Joi.string().allow(''),
  Review: Joi.string().allow(''),
});


function validate(release) {
  return Joi.validate(schema, release, { presence: 'required' });
}

function convert(release) {
  const artist = release['First Name'] ? `${release['First Name']} ` : release['Last Name'];
  const title = `${artist} - ${release.Title}`;
  let ownership = null;

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
    title,
    release_title: release.Title,
    artist,
    year: release.Release_Date,
    rating: parseFloat(release.Rating / 2),
    format: release['Media Type'],
    ownership,
    notes: release.Review,
  };
}

// eslint-disable-next-line import/prefer-default-export
export function fromFile(file) {
  return readFilePromise(file, 'utf8')
    .then(csv => parseCsv(csv, { columns: true }))
    .then(releases => releases
      .map(validate)
      .map(convert)
    );
    // .then(releases => {
      // winston.info('Found %d releases', releases.length);
      // return releases;
    // });
}
