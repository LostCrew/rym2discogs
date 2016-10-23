# Rym￫Discogs

Bring your data from RateYourMusic to Discogs.

## Installation

```
$ npm install rym2discogs
```

## Usage

import rym2discogs from 'rym2discogs';

rym2discogs({
  file: './export.csv',
  username: 'LostCrew',
  token: 'my-token',
  ownership: 'all',
  debug: 'false',
})
  .then(…);
```

## TODO

- Prevent addition of duplicates
- Support for 'past' releases
