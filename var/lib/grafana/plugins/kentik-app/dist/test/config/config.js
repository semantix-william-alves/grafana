'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConfigCtrl = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _config = require('./config.html!text');

var _config2 = _interopRequireDefault(_config);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var KentikConfigCtrl = function () {
  function KentikConfigCtrl($scope, $injector, backendSrv) {
    _classCallCheck(this, KentikConfigCtrl);

    this.backendSrv = backendSrv;

    this.appEditCtrl.setPreUpdateHook(this.preUpdate.bind(this));
    this.appEditCtrl.setPostUpdateHook(this.postUpdate.bind(this));

    if (!this.appModel.jsonData) {
      this.appModel.jsonData = {};
    }
    if (!this.appModel.secureJsonData) {
      this.appModel.secureJsonData = {};
    }
    this.apiValidated = false;
    this.apiError = false;
    if (this.appModel.enabled && this.appModel.jsonData.tokenSet) {
      this.validateApiConnection();
    }
  }

  _createClass(KentikConfigCtrl, [{
    key: 'preUpdate',
    value: function preUpdate() {
      if (this.appModel.secureJsonData.token) {
        this.appModel.jsonData.tokenSet = true;
      }

      return this.initDatasource();
    }
  }, {
    key: 'postUpdate',
    value: function postUpdate() {
      if (!this.appModel.enabled) {
        return Promise.resolve();
      }
      var self = this;
      return this.validateApiConnection().then(function () {
        return self.appEditCtrl.importDashboards().then(function () {
          return {
            url: "dashboard/db/kentik-home",
            message: "Kentik Connect Pro app installed!"
          };
        });
      });
    }

    // make sure that we can hit the Kentik API.

  }, {
    key: 'validateApiConnection',
    value: function validateApiConnection() {
      var _this = this;

      var promise = this.backendSrv.get('/api/plugin-proxy/kentik-app/api/v5/users');
      promise.then(function () {
        _this.apiValidated = true;
      }, function () {
        _this.apiValidated = false;
        _this.apiError = true;
      });
      return promise;
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.appModel.jsonData.email = '';
      this.appModel.jsonData.tokenSet = false;
      this.appModel.secureJsonData = {};
      this.apiValidated = false;
    }
  }, {
    key: 'initDatasource',
    value: function initDatasource() {
      var self = this;
      //check for existing datasource.
      return self.backendSrv.get('/api/datasources').then(function (results) {
        var foundKentic = false;
        _lodash2.default.forEach(results, function (ds) {
          if (foundKentic) {
            return;
          }
          if (ds.name === "kentik") {
            foundKentic = true;
          }
        });
        var promises = [];
        if (!foundKentic) {
          // create datasource.
          var kentik = {
            name: 'kentik',
            type: 'kentik-ds',
            access: 'direct',
            jsonData: {}
          };
          promises.push(self.backendSrv.post('/api/datasources', kentik));
        }
        return Promise.all(promises);
      });
    }
  }]);

  return KentikConfigCtrl;
}();

KentikConfigCtrl.template = _config2.default;

exports.ConfigCtrl = KentikConfigCtrl;
