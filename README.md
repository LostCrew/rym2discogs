# Rym￫Discogs

[![Build Status](https://img.shields.io/travis/LostCrew/rym2discogs.svg)](https://travis-ci.org/LostCrew/rym2discogs)
[![Dependencies Status](https://img.shields.io/david/LostCrew/rym2discogs.svg)](https://david-dm.org/LostCrew/rym2discogs)
[![DevDependencies Status](https://img.shields.io/david/dev/LostCrew/rym2discogs.svg)](https://david-dm.org/LostCrew/rym2discogs?type=dev)

Bring your data from RateYourMusic to Discogs.

## Installation

```bash
$ npm install rym2discogs
or
$ yarn add rym2discogs
```

## Usage

```node
import rym2discogs from 'rym2discogs';
import { resolve } from path;

const results = await rym2discogs({
  file: resolve(__dirname, 'export.csv'), // absolute path to RateYourMusic export file
  username: 'LostCrew', // Discogs username
  token: 'discogs-token', // Discogs token
  ownership: 'all', // 'all', 'collection', 'wantlist'
  verbose: false // boolean
});
```

## TODO

- Prevent addition of duplicates
- Support for 'past' releases
