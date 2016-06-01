import Promise from 'bluebird';
// import disconnect from 'disconnect';


export default class Discogs {
  constructor(options) {
    this.options = options;
    this.oauth = Promise.promisifyAll(this.client.oauth());
    this.database = Promise.promisifyAll(this.client.database());
    this.collection = Promise.promisifyAll(this.client.user().collection());
    this.wantlist = Promise.promisifyAll(this.client.user().wantlist());
    return this;
  }

  auth() {
    return this.oauth.getRequestTokenAsync(this.options.key, this.options.secret);
  }

  searchRelease(data) {
    return this.database.searchAsync(null, data);
  }

  addCollectionRelease(release) {
    return this.collection.addReleaseAsync(this.options.username, 1, release.id);
  }

  getWantlist() {
    return this.wantlist.releasesAsync(this.options.username);
  }

  addWantlistRelease(release) {
    return this.wantlist.addReleaseAsync(this.options.username, release.id, {
      notes: release.notes,
      rating: release.rating,
    });
  }
}
