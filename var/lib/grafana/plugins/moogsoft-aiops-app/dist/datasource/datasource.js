///<reference path="../../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register(['lodash', 'moment'], function(exports_1) {
    var lodash_1, moment_1;
    var MoogsoftDatasource;
    function renderVariable(value, variable) {
        if (typeof value === 'string') {
            return value;
        }
        return value.join(',');
    }
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (moment_1_1) {
                moment_1 = moment_1_1;
            }],
        execute: function() {
            MoogsoftDatasource = (function () {
                /** @ngInject */
                function MoogsoftDatasource(instanceSettings, backendSrv, templateSrv, $q) {
                    this.backendSrv = backendSrv;
                    this.templateSrv = templateSrv;
                    this.$q = $q;
                    this.name = instanceSettings.name;
                    this.id = instanceSettings.id;
                    this.url = instanceSettings.url;
                    this.cache = {};
                }
                //
                // Handles metric queries
                //
                MoogsoftDatasource.prototype.query = function (options) {
                    var _this = this;
                    var commonParams = {
                        from: options.range.from.unix(),
                        to: options.range.to.unix(),
                    };
                    // get valid queries
                    var queries = lodash_1.default.filter(options.targets, function (target) {
                        return lodash_1.default.isString(target.endpoint);
                    });
                    var promises = queries.map(function (query) {
                        var params = lodash_1.default.clone(commonParams);
                        lodash_1.default.forEach(query.filters, function (value, key) {
                            params[key] = '[' + _this.templateSrv.replace(value, options.scopedVars, renderVariable) + ']';
                        });
                        lodash_1.default.forEach(query.stringOptions, function (value, key) {
                            params[key] = value;
                        });
                        return _this.fetch('/' + query.endpoint, params);
                    });
                    return this.$q.all(promises).then(function (series) {
                        return {
                            data: lodash_1.default.flatten(series),
                        };
                    });
                };
                //
                // Test data source (used from data source settings page & app settings page)
                //
                MoogsoftDatasource.prototype.testDatasource = function () {
                    var params = {
                        from: moment_1.default()
                            .subtract(1, 'days')
                            .unix(),
                        to: moment_1.default().unix(),
                    };
                    return this.fetch('/getStats')
                        .then(function (res) {
                        return { status: 'success', message: 'Test Success' };
                    })
                        .catch(function (err) {
                        return { status: 'error', message: err.message };
                    });
                };
                MoogsoftDatasource.prototype.fetch = function (url, params) {
                    return this.backendSrv
                        .datasourceRequest({
                        method: 'GET',
                        url: this.url + "/graze/v1" + url,
                        params: params,
                    })
                        .then(function (res) {
                        return res.data;
                    });
                };
                //
                // Used by template variable queries & dropdowns in the query editor
                //
                MoogsoftDatasource.prototype.metricFindQuery = function (endpoint) {
                    var _this = this;
                    return this.getStats().then(function (stats) {
                        var mapping;
                        for (var _i = 0; _i < stats.length; _i++) {
                            var item = stats[_i];
                            lodash_1.default.forEach(item.parameters, function (value, key) {
                                if (value.mapping && value.mapping.endpoint === endpoint) {
                                    mapping = value.mapping;
                                    return;
                                }
                            });
                        }
                        if (!mapping) {
                            return _this.$q.reject('Could not find mapping for endpoint ' + endpoint);
                        }
                        var promise;
                        if (_this.cache[endpoint]) {
                            promise = _this.$q.when(_this.cache[endpoint]);
                        }
                        else {
                            promise = _this.fetch('/' + endpoint);
                        }
                        return promise.then(function (res) {
                            _this.cache[endpoint] = res;
                            return res.map(function (item) { return ({
                                text: item[mapping.display_value],
                                value: item[mapping.value]
                            }); });
                        });
                    });
                };
                MoogsoftDatasource.prototype.getStats = function () {
                    if (this.statsPromise) {
                        return this.statsPromise;
                    }
                    this.statsPromise = this.fetch('/getStats');
                    return this.statsPromise;
                };
                return MoogsoftDatasource;
            })();
            exports_1("MoogsoftDatasource", MoogsoftDatasource);
        }
    }
});
//# sourceMappingURL=datasource.js.map