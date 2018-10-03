///<reference path="../../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import _ from 'lodash';
import moment from 'moment';

function renderVariable(value, variable) {
  if (typeof value === 'string') {
    return value;
  }
  return value.join(',');
}

export class MoogsoftDatasource {
  id: number;
  name: string;
  url: string;
  cache: any;
  statsPromise: any;

  /** @ngInject */
  constructor(instanceSettings, private backendSrv, private templateSrv, private $q) {
    this.name = instanceSettings.name;
    this.id = instanceSettings.id;
    this.url = instanceSettings.url;
    this.cache = {};
  }

  //
  // Handles metric queries
  //
  query(options) {
    let commonParams = {
      from: options.range.from.unix(),
      to: options.range.to.unix(),
    };

    // get valid queries
    let queries = _.filter(options.targets, target => {
      return _.isString(target.endpoint);
    });

    let promises = queries.map(query => {
      let params = _.clone(commonParams);

      _.forEach(query.filters, (value, key) => {
        params[key] = '[' + this.templateSrv.replace(value, options.scopedVars, renderVariable) + ']' ;
      });

      _.forEach(query.stringOptions, (value, key) => {
        params[key] = value;
      });

      return this.fetch('/' + query.endpoint, params);
    });

    return this.$q.all(promises).then(series => {
      return {
        data: _.flatten(series),
      };
    });
  }

  //
  // Test data source (used from data source settings page & app settings page)
  //
  testDatasource() {
    let params = {
      from: moment()
      .subtract(1, 'days')
      .unix(),
      to: moment().unix(),
    };

    return this.fetch('/getStats')
    .then(res => {
      return { status: 'success', message: 'Test Success' };
    })
    .catch(err => {
      return { status: 'error', message: err.message };
    });
  }

  private fetch(url: string, params?: any) {
    return this.backendSrv
    .datasourceRequest({
      method: 'GET',
      url: `${this.url}/graze/v1${url}`,
      params: params,
    })
    .then(res => {
      return res.data;
    });
  }

  //
  // Used by template variable queries & dropdowns in the query editor
  //
  metricFindQuery(endpoint: string) {
    return this.getStats().then(stats => {
      let mapping;

      for (let item of stats) {
        _.forEach(item.parameters, (value, key) => {
          if (value.mapping && value.mapping.endpoint === endpoint) {
            mapping = value.mapping;
            return;
          }
        });
      }

      if (!mapping) {
        return this.$q.reject('Could not find mapping for endpoint ' + endpoint);
      }

      let promise;

      if (this.cache[endpoint]) {
        promise = this.$q.when(this.cache[endpoint]);
      } else {
        promise = this.fetch('/' + endpoint);
      }

      return promise.then(res => {
        this.cache[endpoint] = res;

        return res.map(item => ({
          text: item[mapping.display_value],
          value: item[mapping.value]
        }));
      });
    });
  }

  getStats(): any {
    if (this.statsPromise) {
      return this.statsPromise;
    }

    this.statsPromise = this.fetch('/getStats');

    return this.statsPromise;
  }
}
