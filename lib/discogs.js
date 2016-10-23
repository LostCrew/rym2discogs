'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _disconnect = require('disconnect');

var _disconnect2 = _interopRequireDefault(_disconnect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Discogs = function () {
  function Discogs(options) {
    (0, _classCallCheck3.default)(this, Discogs);

    this.options = options;
    this.client = new _disconnect2.default.Client({ userToken: options.token });
    this.database = _bluebird2.default.promisifyAll(this.client.database());
    this.collection = _bluebird2.default.promisifyAll(this.client.user().collection());
    this.wantlist = _bluebird2.default.promisifyAll(this.client.user().wantlist());
  }

  (0, _createClass3.default)(Discogs, [{
    key: 'getWantlist',
    value: function getWantlist() {
      return this.wantlist.releasesAsync(this.options.username);
    }
  }, {
    key: 'searchRelease',
    value: function searchRelease(options) {
      return this.database.searchAsync(null, options);
    }
  }, {
    key: 'addCollectionRelease',
    value: function addCollectionRelease(id) {
      return this.collection.addReleaseAsync(this.options.username, 1, id);
    }
  }, {
    key: 'addWantlistRelease',
    value: function addWantlistRelease(id, options) {
      return this.wantlist.addReleaseAsync(this.options.username, id, options);
    }
  }]);
  return Discogs;
}();

exports.default = Discogs;