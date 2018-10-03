/**
 * Copyright 2017 Ambud Sharma
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
import {QueryCtrl} from 'app/plugins/sdk';
import './css/query-editor.css!'

export class SidewinderDatasourceQueryCtrl extends QueryCtrl {

  constructor($scope, $injector)  {
    super($scope, $injector);
    this.scope = $scope;
    this.target.target = this.target.target;
    this.target.type = 'timeserie';
    if(!this.target.raw) {
      this.target.raw = '';
    }
    if(!this.target.filters) {
      this.target.filters = [];
    }
    if(!this.target.aggregator) {
      this.target.aggregator = { name:"none", args:[{ index:0, type: "int", value: 10 }], unit: "secs" };
    }
  }

  toggleEditorMode() {
    this.target.rawQuery = !this.target.rawQuery;
  }

  onChangeInternal() {
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }

  getMeasurementOptions() {
    if (!this.target.target) {
      this.target.target = '';
    }
    return this.datasource.metricFindQuery(this.target);
  }

  getTagOptions() {
    var res = this.datasource.tagFindQuery(this.target);
    return res;
  }
  
  getTagValueOptions(tagKey) {
    var res = this.datasource.tagValueFindQuery(this.target, tagKey);
    return res;
  }

  getConditionOptions() {
    return this.datasource.conditionTypes(this.target);
  }
  
  getOperatorOptions() {
	  console.log("ctrl operator options")
	  
	return this.datasource.operatorTypes(this.target);
  }

  getFieldOptions() {
    if (!this.target.field) {
    		this.target.field = '';
    }
    return this.datasource.fieldOptionsQuery(this.target);
  }

  getAggregators() {
    return this.datasource.getAggregators(this.target);
  }

  getUnits() {
    return this.datasource.getUnits(this.target);
  }

  removeAggregator() {
    this.target.aggregator = {};
  }

  addFilter() {
    if(this.target.filters.length>0) {
      this.target.filters.push({'type':'condition', 'value':'AND'});
    }
    this.target.filters.push({'operator':'=', 'key':'Tag Key', 'value':'Tag Value'});
    this.panelCtrl.refresh();
  }

  addArgs() {
    if(this.target.aggregator.name && !this.target.aggregator.args) {
      this.target.aggregator.args = [];
    }
    this.panelCtrl.refresh();
  }

  removeFilter(index, segment) {
    this.target.filters.splice(index, 1)
    if(index>1 || (index==0 && this.target.filters.length>0)) {
      this.target.filters.splice(index, 1);
    }
    if(index>=this.target.filters.length) {
      this.target.filters.splice(this.target.filters.length-1, 1);
    }
    this.panelCtrl.refresh();
  }

  onChangeFilter(index, segment) {
    this.target.filters[index] = segment;
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }
}

SidewinderDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
