import Promise from 'bluebird';
const readFile = Promise.promisify(require('fs').readFile);
const parseCsv = Promise.promisify(require('csv-parse'));

export default class Rym {
  static fromExport() {  // userId
    // return request({
    //     url: `https://rateyourmusic.com/user_albums_export?album_list_id=${userId}&noreview`,
    //     headers: {
    //       'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    //       'accept-encoding': 'gzip, deflate, sdch',
    //       'accept-language': 'en-US,en;q=0.8,it;q=0.6',
    //       'cache-control': 'no-cache',
    //       'dnt': 1,
    //       'pragma': 'no-cache',
    //       'referer': 'https://rateyourmusic.com/~LostCrew',
    //       'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5)' +
    //         'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36'
    //     }
    //   });
  }

  static fromFile(file) {
    return readFile(file, 'utf8')
      .then(csv => parseCsv(csv, { columns: true }));
  }
}
