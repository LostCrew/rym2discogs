import Promise from 'bluebird';
import { readFile } from 'fs';
import csvParse from 'csv-parse';
import Joi from 'joi';
import winston from 'winston';


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
export async function fromFile(path) {
  const csv = await readFilePromise(path, 'utf8');
  const raw = await parseCsv(csv, {
    columns: true,
    skip_empty_lines: true,
  });
  winston.verbose('Found %d RYM releases', raw.length);
  winston.verbose('Validating RYM releases…');
  const validated = raw.map(validate);
  winston.verbose('Converting RYM releases to Discogs format…');
  const releases = validated.map(convert);
  return Promise.resolve(releases);
}
