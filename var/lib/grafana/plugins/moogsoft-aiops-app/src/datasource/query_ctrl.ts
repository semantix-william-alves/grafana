///<reference path="../../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import _ from 'lodash';
import { QueryCtrl } from 'app/plugins/sdk';
import appEvents from 'app/core/app_events';

export class MoogsoftQueryCtrl extends QueryCtrl {
  static templateUrl = 'partials/query.editor.html';

  // available endpoints
  endpointOptions = [];

  // the moogsoft stats meta data
  stats: any;

  // stores the stat filters & mapping
  filters: any[];
  stringOptions: any[];

  /** @ngInject **/
  constructor($scope, $injector, private templateSrv) {
    super($scope, $injector);

    this.filters = [];
    this.stringOptions = [];

    // init defaults for a new query
    this.target.endpoint = this.target.endpoint || 'getTeamSituationStats';
    this.target.filters = this.target.filters || {};
    this.target.filtersText = this.target.filtersText || {};
    this.target.stringOptions = this.target.stringOptions || {};

    // before initializing the query model we need the stats metadata
    this.datasource.getStats().then(stats => {
      this.stats = stats;
      this.endpointOptions = _.map(this.stats, item => ({
        text: item.display_name,
        value: item.endpoint,
      }));
      this.endpointChanged(false);
    });
  }

  //
  // Setup query model when endpoint changes (or when query editor is looded)
  //
  endpointChanged(clearFilters) {
    if (clearFilters) {
      this.target.filters = {};
      this.target.filtersText = {};
      this.target.stringOptions = {};
    }

    let endpoint = _.find(this.stats, { endpoint: this.target.endpoint });

    this.filters = [];
    this.stringOptions = [];

    _.forEach(endpoint.parameters, (value, key) => {
      if (key === 'from' || key === 'to') {
        return;
      }

      if (value.type === 'mapped') {
        this.filters.push({
          key: key,
          type: value.type,
          mapping: value.mapping,
          selected: {
            text: 'Select',
            value: 0,
          },
        });
      }

      if (value.type === 'string') {
        this.target.stringOptions[key] = this.target.stringOptions[key] || value.default;

        this.stringOptions.push({
          key: key,
          type: value.type,
          options: value.static_mapping,
        });
      }

    });

    this.refresh();
  }

  getFilterOptions(filter) {
    return this.datasource.metricFindQuery(filter.mapping.endpoint).catch(err => {
      console.log('Failed to get filter options', err);
      let message = err.data;
      if (err.statusText) {
        message = 'Status: '+ err.statusText;
      }

      appEvents.emit('alert-error', ['Moogsoft API Error', message]);
    });
  }

  clearFilters() {
    this.target.filters = {};
    this.target.filtersText = {};
    this.refresh();
  }

  addFilter(filter) {
    if (this.target.filters[filter.key]) {
      this.target.filters[filter.key] += ',' + filter.selected.value.toString();
      this.target.filtersText[filter.key] += ',' + filter.selected.text;
    } else {
      this.target.filters[filter.key] = filter.selected.value.toString();
      this.target.filtersText[filter.key] = filter.selected.text;
    }

    filter.selected = { value: 0, text: 'Select' };
    this.refresh();
  }

}
