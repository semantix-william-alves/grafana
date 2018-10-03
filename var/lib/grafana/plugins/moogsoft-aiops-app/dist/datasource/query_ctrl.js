///<reference path="../../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register(['lodash', 'app/plugins/sdk', 'app/core/app_events'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var lodash_1, sdk_1, app_events_1;
    var MoogsoftQueryCtrl;
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            },
            function (app_events_1_1) {
                app_events_1 = app_events_1_1;
            }],
        execute: function() {
            MoogsoftQueryCtrl = (function (_super) {
                __extends(MoogsoftQueryCtrl, _super);
                /** @ngInject **/
                function MoogsoftQueryCtrl($scope, $injector, templateSrv) {
                    var _this = this;
                    _super.call(this, $scope, $injector);
                    this.templateSrv = templateSrv;
                    // available endpoints
                    this.endpointOptions = [];
                    this.filters = [];
                    this.stringOptions = [];
                    // init defaults for a new query
                    this.target.endpoint = this.target.endpoint || 'getTeamSituationStats';
                    this.target.filters = this.target.filters || {};
                    this.target.filtersText = this.target.filtersText || {};
                    this.target.stringOptions = this.target.stringOptions || {};
                    // before initializing the query model we need the stats metadata
                    this.datasource.getStats().then(function (stats) {
                        _this.stats = stats;
                        _this.endpointOptions = lodash_1.default.map(_this.stats, function (item) { return ({
                            text: item.display_name,
                            value: item.endpoint,
                        }); });
                        _this.endpointChanged(false);
                    });
                }
                //
                // Setup query model when endpoint changes (or when query editor is looded)
                //
                MoogsoftQueryCtrl.prototype.endpointChanged = function (clearFilters) {
                    var _this = this;
                    if (clearFilters) {
                        this.target.filters = {};
                        this.target.filtersText = {};
                        this.target.stringOptions = {};
                    }
                    var endpoint = lodash_1.default.find(this.stats, { endpoint: this.target.endpoint });
                    this.filters = [];
                    this.stringOptions = [];
                    lodash_1.default.forEach(endpoint.parameters, function (value, key) {
                        if (key === 'from' || key === 'to') {
                            return;
                        }
                        if (value.type === 'mapped') {
                            _this.filters.push({
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
                            _this.target.stringOptions[key] = _this.target.stringOptions[key] || value.default;
                            _this.stringOptions.push({
                                key: key,
                                type: value.type,
                                options: value.static_mapping,
                            });
                        }
                    });
                    this.refresh();
                };
                MoogsoftQueryCtrl.prototype.getFilterOptions = function (filter) {
                    return this.datasource.metricFindQuery(filter.mapping.endpoint).catch(function (err) {
                        console.log('Failed to get filter options', err);
                        var message = err.data;
                        if (err.statusText) {
                            message = 'Status: ' + err.statusText;
                        }
                        app_events_1.default.emit('alert-error', ['Moogsoft API Error', message]);
                    });
                };
                MoogsoftQueryCtrl.prototype.clearFilters = function () {
                    this.target.filters = {};
                    this.target.filtersText = {};
                    this.refresh();
                };
                MoogsoftQueryCtrl.prototype.addFilter = function (filter) {
                    if (this.target.filters[filter.key]) {
                        this.target.filters[filter.key] += ',' + filter.selected.value.toString();
                        this.target.filtersText[filter.key] += ',' + filter.selected.text;
                    }
                    else {
                        this.target.filters[filter.key] = filter.selected.value.toString();
                        this.target.filtersText[filter.key] = filter.selected.text;
                    }
                    filter.selected = { value: 0, text: 'Select' };
                    this.refresh();
                };
                MoogsoftQueryCtrl.templateUrl = 'partials/query.editor.html';
                return MoogsoftQueryCtrl;
            })(sdk_1.QueryCtrl);
            exports_1("MoogsoftQueryCtrl", MoogsoftQueryCtrl);
        }
    }
});
//# sourceMappingURL=query_ctrl.js.map