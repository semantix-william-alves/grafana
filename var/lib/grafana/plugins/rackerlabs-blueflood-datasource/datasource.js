'use strict';

System.register(['angular', 'lodash', 'moment', 'app/core/utils/datemath'], function (_export, _context) {
    "use strict";

    var angular, _, moment, dateMath, _createClass, BluefloodDatasource;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    return {
        setters: [function (_angular) {
            angular = _angular.default;
        }, function (_lodash) {
            _ = _lodash.default;
        }, function (_moment) {
            moment = _moment.default;
        }, function (_appCoreUtilsDatemath) {
            dateMath = _appCoreUtilsDatemath;
        }],
        execute: function () {
            _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || false;
                        descriptor.configurable = true;
                        if ("value" in descriptor) descriptor.writable = true;
                        Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }

                return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);
                    if (staticProps) defineProperties(Constructor, staticProps);
                    return Constructor;
                };
            }();

            _export('BluefloodDatasource', BluefloodDatasource = function () {
                function BluefloodDatasource(instanceSettings, $q, backendSrv, templateSrv) {
                    _classCallCheck(this, BluefloodDatasource);

                    this.url = instanceSettings.url;
                    this.name = instanceSettings.name;
                    this.render_method = instanceSettings.render_method || 'POST';
                    this._seriesRefLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                    this.$q = $q;
                    this.backendSrv = backendSrv;
                    this.templateSrv = templateSrv;
                }

                _createClass(BluefloodDatasource, [{
                    key: 'query',
                    value: function query(options) {
                        var graphOptions = {
                            from: this.translateTime(options.rangeRaw.from, false),
                            until: this.translateTime(options.rangeRaw.to, true),
                            targets: options.targets,
                            format: options.format,
                            cacheTimeout: options.cacheTimeout || this.cacheTimeout,
                            maxDataPoints: options.maxDataPoints
                        };

                        var params = this.buildGraphiteParams(graphOptions, options.scopedVars);
                        if (params.length === 0) {
                            return this.$q.when({ data: [] });
                        }

                        if (options.format === 'png') {
                            return this.$q.when({ data: this.url + '/render' + '?' + params.join('&') });
                        }

                        var httpOptions = { method: this.render_method, url: '/render' };

                        if (httpOptions.method === 'GET') {
                            httpOptions.url = httpOptions.url + '?' + params.join('&');
                        } else {
                            httpOptions.data = params.join('&');
                            httpOptions.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
                        }

                        return this.doGraphiteRequest(httpOptions).then(this.convertDataPointsToMs);
                    }
                }, {
                    key: 'convertDataPointsToMs',
                    value: function convertDataPointsToMs(result) {
                        if (!result || !result.data) {
                            return [];
                        }
                        for (var i = 0; i < result.data.length; i++) {
                            var series = result.data[i];
                            for (var y = 0; y < series.datapoints.length; y++) {
                                series.datapoints[y][1] *= 1000;
                            }
                        }
                        return result;
                    }
                }, {
                    key: 'annotationQuery',
                    value: function annotationQuery(options) {
                        // Graphite metric as annotation
                        if (options.annotation.target) {
                            var target = this.templateSrv.replace(options.annotation.target, {}, 'glob');
                            var graphiteQuery = {
                                rangeRaw: options.rangeRaw,
                                targets: [{ target: target }],
                                format: 'json',
                                maxDataPoints: 100
                            };

                            return this.query(graphiteQuery).then(function (result) {
                                var list = [];

                                for (var i = 0; i < result.data.length; i++) {
                                    var target = result.data[i];

                                    for (var y = 0; y < target.datapoints.length; y++) {
                                        var datapoint = target.datapoints[y];
                                        if (!datapoint[0]) {
                                            continue;
                                        }

                                        list.push({
                                            annotation: options.annotation,
                                            time: datapoint[1],
                                            title: target.target
                                        });
                                    }
                                }

                                return list;
                            });
                        } else {
                            // Graphite event as annotation
                            var tags = this.templateSrv.replace(options.annotation.tags);
                            return this.events({ range: options.rangeRaw, tags: tags }).then(function (results) {
                                var list = [];
                                for (var i = 0; i < results.data.length; i++) {
                                    var e = results.data[i];

                                    list.push({
                                        annotation: options.annotation,
                                        time: e.when * 1000,
                                        title: e.what,
                                        tags: e.tags,
                                        text: e.data
                                    });
                                }
                                return list;
                            });
                        }
                    }
                }, {
                    key: 'events',
                    value: function events(options) {
                        try {
                            var tags = '';
                            if (options.tags) {
                                tags = '&tags=' + options.tags;
                            }

                            return this.doGraphiteRequest({
                                method: 'GET',
                                url: '/events/get_data?from=' + this.translateTime(options.range.from, false) + '&until=' + this.translateTime(options.range.to, true) + tags
                            });
                        } catch (err) {
                            return this.$q.reject(err);
                        }
                    }
                }, {
                    key: 'translateTime',
                    value: function translateTime(date, roundUp) {
                        if (_.isString(date)) {
                            if (date === 'now') {
                                return 'now';
                            } else if (date.indexOf('now-') >= 0 && date.indexOf('/') === -1) {
                                date = date.substring(3);
                                date = date.replace('m', 'min');
                                date = date.replace('M', 'mon');
                                return date;
                            }
                            date = dateMath.parse(date, roundUp);
                        }

                        // graphite' s from filter is exclusive
                        // here we step back one minute in order
                        // to guarantee that we get all the data that
                        // exists for the specified range
                        if (roundUp) {
                            if (date.get('s')) {
                                date.add(1, 'm');
                            }
                        } else if (roundUp === false) {
                            if (date.get('s')) {
                                date.subtract(1, 'm');
                            }
                        }

                        return date.unix();
                    }
                }, {
                    key: 'metricFindQuery',
                    value: function metricFindQuery(query) {
                        var interpolated;
                        try {
                            interpolated = encodeURIComponent(this.templateSrv.replace(query));
                        } catch (err) {
                            return this.$q.reject(err);
                        }

                        return this.doGraphiteRequest({ method: 'GET', url: '/metrics/find/?query=' + interpolated }).then(function (results) {
                            return _.map(results.data, function (metric) {
                                return {
                                    text: metric.text,
                                    expandable: metric.expandable ? true : false
                                };
                            });
                        });
                    }
                }, {
                    key: 'testDatasource',
                    value: function testDatasource() {
                        return this.metricFindQuery('*').then(function () {
                            return { status: "success", message: "Data source is working", title: "Success" };
                        });
                    }
                }, {
                    key: 'listDashboards',
                    value: function listDashboards(query) {
                        return this.doGraphiteRequest({ method: 'GET', url: '/dashboard/find/', params: { query: query || '' } }).then(function (results) {
                            return results.data.dashboards;
                        });
                    }
                }, {
                    key: 'loadDashboard',
                    value: function loadDashboard(dashName) {
                        return this.doGraphiteRequest({ method: 'GET', url: '/dashboard/load/' + encodeURIComponent(dashName) });
                    }
                }, {
                    key: 'doGraphiteRequest',
                    value: function doGraphiteRequest(options) {
                        options.url = this.url + options.url;
                        options.inspect = { type: 'graphite' };

                        return this.backendSrv.datasourceRequest(options);
                    }
                }, {
                    key: 'buildGraphiteParams',
                    value: function buildGraphiteParams(options, scopedVars) {
                        var graphite_options = ['from', 'until', 'rawData', 'format', 'maxDataPoints', 'cacheTimeout'];
                        var clean_options = [],
                            targets = {};
                        var target, targetValue, i;
                        var regex = /\#([A-Z])/g;
                        var intervalFormatFixRegex = /'(\d+)m'/gi;
                        var hasTargets = false;

                        if (options.format !== 'png') {
                            options['format'] = 'json';
                        }

                        function fixIntervalFormat(match) {
                            return match.replace('m', 'min').replace('M', 'mon');
                        }

                        for (i = 0; i < options.targets.length; i++) {
                            target = options.targets[i];
                            if (!target.target) {
                                continue;
                            }

                            if (!target.refId) {
                                target.refId = this._seriesRefLetters[i];
                            }

                            targetValue = this.templateSrv.replace(target.target, scopedVars);
                            targetValue = targetValue.replace(intervalFormatFixRegex, fixIntervalFormat);
                            targets[target.refId] = targetValue;
                        }

                        function nestedSeriesRegexReplacer(match, g1) {
                            return targets[g1];
                        }

                        for (i = 0; i < options.targets.length; i++) {
                            target = options.targets[i];
                            if (!target.target) {
                                continue;
                            }

                            targetValue = targets[target.refId];
                            targetValue = targetValue.replace(regex, nestedSeriesRegexReplacer);
                            targets[target.refId] = targetValue;

                            if (!target.hide) {
                                hasTargets = true;
                                clean_options.push("target=" + encodeURIComponent(targetValue));
                            }
                        }

                        _.each(options, function (value, key) {
                            if (_.indexOf(graphite_options, key) === -1) {
                                return;
                            }
                            if (value) {
                                clean_options.push(key + "=" + encodeURIComponent(value));
                            }
                        });

                        if (!hasTargets) {
                            return [];
                        }

                        return clean_options;
                    }
                }]);

                return BluefloodDatasource;
            }());

            _export('BluefloodDatasource', BluefloodDatasource);
        }
    };
});
//# sourceMappingURL=datasource.js.map
