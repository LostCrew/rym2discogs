import Rym from './rym';
import Discogs from './discogs';


export default function main(options) {
  console.log(options);

  const discogs = new Discogs({
    consumerKey: options.key,
    consumerSecret: options.secret,
    username: options.username,
  });

  const processReleases = releases => releases.map(release => ({
    id: release['RYM Album'],
    release_title: release.Title,
    artist: release['First Name'] ? `${release['First Name']} ` : release['Last Name'],
    year: release.Release_Date,
    rating: parseInt(release.Rating / 2, 10),
    ownership: (() => {
      switch (release.Ownership) {
        case 'w': return 'wantlist';
        case 'o': return 'collection';
        default: return null;
      }
    })(),
    notes: release.Review,
  }));

  const filterReleases = releases => releases
    .filter(release => release.ownership === 'wantlist')
    .slice(0, 1);

  const searchReleases = releases => releases
    .map(release => discogs.searchRelease({
      release_title: release.release_title,
      type: release.type,
      artist: release.artist,
    }));

  Rym
    .fromFile(options.file)
    .then(processReleases)
    .then(filterReleases)
    .then(searchReleases)
    .then(data => {
      console.log(data);
      // return discogs
      //   .addWantlistRelease(data.results[0])
      //   .then((data) => {
      //     console.log(data);
      //   });
    })
    .catch(console.log.bind(console));
}
