System.register(['../time_grain_converter'], function(exports_1) {
    var time_grain_converter_1;
    var AzureMonitorFilterBuilder;
    return {
        setters:[
            function (time_grain_converter_1_1) {
                time_grain_converter_1 = time_grain_converter_1_1;
            }],
        execute: function() {
            AzureMonitorFilterBuilder = (function () {
                function AzureMonitorFilterBuilder(metricName, from, to, timeGrain, grafanaInterval) {
                    this.metricName = metricName;
                    this.from = from;
                    this.to = to;
                    this.timeGrain = timeGrain;
                    this.grafanaInterval = grafanaInterval;
                    this.timeGrainInterval = '';
                    this.allowedTimeGrains = ['1m', '5m', '15m', '30m', '1h', '6h', '12h', '1d'];
                }
                AzureMonitorFilterBuilder.prototype.setAllowedTimeGrains = function (timeGrains) {
                    var _this = this;
                    this.allowedTimeGrains = [];
                    timeGrains.forEach(function (tg) {
                        if (tg.value === 'auto') {
                            _this.allowedTimeGrains.push(tg.value);
                        }
                        else {
                            _this.allowedTimeGrains.push(time_grain_converter_1.default.createKbnUnitFromISO8601Duration(tg.value));
                        }
                    });
                };
                AzureMonitorFilterBuilder.prototype.setAggregation = function (agg) {
                    this.aggregation = agg;
                };
                AzureMonitorFilterBuilder.prototype.setDimensionFilter = function (dimension, dimensionFilter) {
                    this.dimension = dimension;
                    this.dimensionFilter = dimensionFilter;
                };
                AzureMonitorFilterBuilder.prototype.generateFilter = function () {
                    var filter = this.createDatetimeAndTimeGrainConditions();
                    if (this.aggregation) {
                        filter += "&aggregation=" + this.aggregation;
                    }
                    if (this.metricName && this.metricName.trim().length > 0) {
                        filter += "&metricnames=" + this.metricName;
                    }
                    if (this.dimension && this.dimensionFilter && this.dimensionFilter.trim().length > 0) {
                        filter += "&$filter=" + this.dimension + " eq '" + this.dimensionFilter + "'";
                    }
                    return filter;
                };
                AzureMonitorFilterBuilder.prototype.createDatetimeAndTimeGrainConditions = function () {
                    var dateTimeCondition = "timespan=" + this.from.utc().format() + "/" + this.to.utc().format();
                    if (this.timeGrain === 'auto') {
                        this.timeGrain = this.calculateAutoTimeGrain();
                    }
                    var timeGrainCondition = "&interval=" + this.timeGrain;
                    return dateTimeCondition + timeGrainCondition;
                };
                AzureMonitorFilterBuilder.prototype.calculateAutoTimeGrain = function () {
                    var roundedInterval = time_grain_converter_1.default.findClosestTimeGrain(this.grafanaInterval, this.allowedTimeGrains);
                    return time_grain_converter_1.default.createISO8601DurationFromInterval(roundedInterval);
                };
                return AzureMonitorFilterBuilder;
            })();
            exports_1("default", AzureMonitorFilterBuilder);
        }
    }
});
//# sourceMappingURL=azure_monitor_filter_builder.js.map