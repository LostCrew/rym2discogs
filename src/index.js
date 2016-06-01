import inquirer from 'inquirer';
import minimist from 'minimist';

import app from './app';

// const options = {
//   "key": "IjnjuEmBHizfjeNVNeiw",
//   "secret": "FsbpudFloRnnHguUUOgLePYBZkioHHri",
//   "username": "LostCrew",
//   "file": "./export.csv",
//   "review2note": "false"
// };

const args = minimist(process.argv.slice(2), {
  alias: {
    f: 'file',
  },
});

// TODO: if missing arguments
inquirer.prompt([{
  name: 'rymFile',
  message: 'Specify a RYM data export file if you want to import RYM data this way',
  when: () => !args.file,
}, {
  name: 'rymId',
  message: 'What is your RYM ID',
  when: answers => !answers.rymFile,
}, {
  name: 'discogsUsername',
  message: 'What is your username on Discogs?',
  when: answers => !args.username,
}, {
  name: 'discogsToken',
  message: 'What is your Discogs token?',
}], app);
