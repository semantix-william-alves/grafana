'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SidewinderDatasource = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright 2017 Ambud Sharma
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * you may not use this file except in compliance with the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * You may obtain a copy of the License at
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * 		http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * See the License for the specific language governing permissions and
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SidewinderDatasource = exports.SidewinderDatasource = function () {
  function SidewinderDatasource(instanceSettings, $q, backendSrv, templateSrv) {
    _classCallCheck(this, SidewinderDatasource);

    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
    this.withCredentials = instanceSettings.withCredentials;
    this.headers = { 'Content-Type': 'application/json' };
    if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
      this.headers['Authorization'] = instanceSettings.basicAuth;
    }
  }

  _createClass(SidewinderDatasource, [{
    key: 'query',
    value: function query(options) {
      var query = this.buildQueryParameters(options);
      query.targets = query.targets.filter(function (t) {
        return !t.hide;
      });

      if (query.targets.length <= 0) {
        return this.q.when({ data: [] });
      }

      return this.backendSrv.datasourceRequest({
        url: this.url + '/query',
        data: query,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }, {
    key: 'testDatasource',
    value: function testDatasource() {
      return this.doRequest({
        url: this.url + '/hc',
        method: 'GET'
      }).then(function (response) {
        if (response.status === 200) {
          return { status: "success", message: "Data source is working", title: "Success" };
        }
      });
    }
  }, {
    key: 'getUnits',
    value: function getUnits(options) {
      var target = typeof options === "string" ? options : options.target;
      var interpolated = {
        target: this.templateSrv.replace(target, null, 'regex')
      };

      return this.backendSrv.datasourceRequest({
        url: this.url + '/query/units',
        data: interpolated,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(this.mapToTextValue);
    }
  }, {
    key: 'getAggregators',
    value: function getAggregators(options) {
      var target = typeof options === "string" ? options : options.target;
      var interpolated = {
        target: this.templateSrv.replace(target, null, 'regex')
      };

      return this.backendSrv.datasourceRequest({
        url: this.url + '/query/aggregators',
        data: interpolated,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(this.mapToTextValue);
    }
  }, {
    key: 'conditionTypes',
    value: function conditionTypes(options) {
      return this.backendSrv.datasourceRequest({
        url: this.url + '/query/ctypes',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(this.mapToTextValue);
    }
  }, {
    key: 'operatorTypes',
    value: function operatorTypes(options) {
      return this.backendSrv.datasourceRequest({
        url: this.url + '/query/otypes',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(this.mapToTextValue);
    }
  }, {
    key: 'metricFindQuery',
    value: function metricFindQuery(options) {
      var target = typeof options === "string" ? options : options.target;
      var interpolated = {
        target: this.templateSrv.replace(target, null, 'regex')
      };

      return this.backendSrv.datasourceRequest({
        url: this.url + '/query/measurements',
        data: interpolated,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(this.mapToTextValue);
    }
  }, {
    key: 'tagFindQuery',
    value: function tagFindQuery(options) {
      var target = typeof options === "string" ? options : options.target;
      var interpolated = {
        target: this.templateSrv.replace(target, null, 'regex')
      };

      return this.backendSrv.datasourceRequest({
        url: this.url + '/query/tags',
        data: interpolated,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(this.mapToTextValue);
    }
  }, {
    key: 'tagValueFindQuery',
    value: function tagValueFindQuery(options, tag) {
      var target = typeof options === "string" ? options : options.target;
      var tag = typeof tag === "string" ? tag : options.tag;
      var interpolated = {
        target: this.templateSrv.replace(target, null, 'regex'),
        tag: this.templateSrv.replace(tag, null, 'regex')
      };

      return this.backendSrv.datasourceRequest({
        url: this.url + '/query/tagvs',
        data: interpolated,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(this.mapToTextValue);
    }
  }, {
    key: 'fieldOptionsQuery',
    value: function fieldOptionsQuery(options) {
      var target = typeof options === "string" ? options : options.target;
      var interpolated = {
        target: this.templateSrv.replace(target, null, 'regex')
      };

      return this.backendSrv.datasourceRequest({
        url: this.url + '/query/fields',
        data: interpolated,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(this.mapToTextValue);
    }
  }, {
    key: 'mapToTextValue',
    value: function mapToTextValue(result) {
      return _lodash2.default.map(result.data, function (d, i) {
        if (d && d.text && d.value) {} else if (_lodash2.default.isObject(d)) {
          return { text: d, value: i };
        }
        return { text: d, value: d };
      });
    }
  }, {
    key: 'doRequest',
    value: function doRequest(options) {
      options.withCredentials = this.withCredentials;
      options.headers = this.headers;

      return this.backendSrv.datasourceRequest(options);
    }
  }, {
    key: 'buildQueryParameters',
    value: function buildQueryParameters(options) {
      var _this = this;

      // remove placeholder targets
      options.targets = _lodash2.default.filter(options.targets, function (target) {
        return target.target !== 'select metric';
      });

      var targets = _lodash2.default.map(options.targets, function (target) {
        var ts = target.aggregator.args[0].value;
        if (target.aggregator.unit == 'mins') {
          ts = target.aggregator.args[0].value * 60;
        } else if (target.aggregator.unit == 'hours') {
          ts = target.aggregator.args[0].value * 3600;
        } else if (target.aggregator.unit == 'days') {
          ts = target.aggregator.args[0].value * 3600 * 24;
        } else if (target.aggregator.unit == 'weeks') {
          ts = target.aggregator.args[0].value * 3600 * 24 * 7;
        } else if (target.aggregator.unit == 'months') {
          ts = target.aggregator.args[0].value * 3600 * 24 * 30;
        } else if (target.aggregator.unit == 'months') {
          ts = target.aggregator.args[0].value * 3600 * 24 * 365;
        }
        var req = {};
        if (target.rawQuery) {
          req = {
            target: _this.templateSrv.replace(target.target),
            refId: target.refId,
            hide: target.hide,
            raw: _this.templateSrv.replace(target.raw),
            rawQuery: target.rawQuery,
            type: target.type || 'timeserie'
          };
        } else {
          req = {
            target: _this.templateSrv.replace(target.target),
            filters: target.filters,
            aggregator: target.aggregator,
            correlate: target.correlate,
            field: _this.templateSrv.replace(target.field),
            refId: target.refId,
            hide: target.hide,
            type: target.type || 'timeserie'
          };
        }
        return req;
      });

      options.targets = targets;
      return options;
    }
  }]);

  return SidewinderDatasource;
}();
//# sourceMappingURL=datasource.js.map
