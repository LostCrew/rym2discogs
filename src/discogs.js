import Promise from 'bluebird';
import disconnect from 'disconnect';


export default class Discogs {
  constructor(options) {
    this.options = options;
    this.client = new disconnect.Client({ userToken: options.token });
    this.database = Promise.promisifyAll(this.client.database());
    this.collection = Promise.promisifyAll(this.client.user().collection());
    this.wantlist = Promise.promisifyAll(this.client.user().wantlist());
  }

  getWantlist() {
    return this.wantlist.releasesAsync(this.options.username);
  }

  searchRelease(options) {
    return this.database.searchAsync(null, options);
  }

  addCollectionRelease(id) {
    return this.collection.addReleaseAsync(this.options.username, 1, id);
  }

  addWantlistRelease(id, options) {
    return this.wantlist.addReleaseAsync(this.options.username, id, options);
  }
}
