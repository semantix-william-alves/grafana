/**
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
import _ from "lodash";

export class SidewinderDatasource {

  constructor(instanceSettings, $q, backendSrv, templateSrv) {
    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
    this.withCredentials = instanceSettings.withCredentials;
    this.headers = {'Content-Type': 'application/json'};
    if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
      this.headers['Authorization'] = instanceSettings.basicAuth;
    }
  }

  query(options) {
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

  testDatasource() {
    return this.doRequest({
      url: this.url + '/hc',
      method: 'GET',
    }).then(response => {
      if (response.status === 200) {
        return { status: "success", message: "Data source is working", title: "Success" };
      }
    });
  }

  getUnits(options) {
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

  getAggregators(options) {
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

  conditionTypes(options) {
    return this.backendSrv.datasourceRequest({
        url: this.url + '/query/ctypes',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(this.mapToTextValue);
  }
  
  operatorTypes(options) {
    return this.backendSrv.datasourceRequest({
        url: this.url + '/query/otypes',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(this.mapToTextValue);
  }

  metricFindQuery(options) {
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

  tagFindQuery(options) {
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
  
  tagValueFindQuery(options, tag) {
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

  fieldOptionsQuery(options) {
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

  mapToTextValue(result) {
    return _.map(result.data, (d, i) => {
      if (d && d.text && d.value) {
      } else if (_.isObject(d)) {
        return { text: d, value: i};
      }
      return { text: d, value: d };
    });
  }

  doRequest(options) {
    options.withCredentials = this.withCredentials;
    options.headers = this.headers;

    return this.backendSrv.datasourceRequest(options);
  }

  buildQueryParameters(options) {
    var _this = this;

    // remove placeholder targets
    options.targets = _.filter(options.targets, function (target) {
      return target.target !== 'select metric';
    });

    var targets = _.map(options.targets, function (target) {
      var ts = target.aggregator.args[0].value;
      if(target.aggregator.unit=='mins') {
        ts = target.aggregator.args[0].value*60;
      }else if(target.aggregator.unit=='hours') {
        ts = target.aggregator.args[0].value*3600;
      }else if(target.aggregator.unit=='days') {
        ts = target.aggregator.args[0].value*3600*24;
      }else if(target.aggregator.unit=='weeks') {
        ts = target.aggregator.args[0].value*3600*24*7;
      }else if(target.aggregator.unit=='months') {
        ts = target.aggregator.args[0].value*3600*24*30;
      }else if(target.aggregator.unit=='months') {
        ts = target.aggregator.args[0].value*3600*24*365;
      }
      var req = {};
      if(target.rawQuery) {
        req= {
          target: _this.templateSrv.replace(target.target),
          refId: target.refId,
                hide: target.hide,
              raw: _this.templateSrv.replace(target.raw),
              rawQuery: target.rawQuery,
                type: target.type || 'timeserie'
        }
      }else {
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
}
