import {
    MetricsPanelCtrl
} from 'app/plugins/sdk';

import "./css/annunciator-panel.css!";

import _ from 'lodash';
import $ from 'jquery';
import 'jquery.flot';
import angular from 'angular';
import kbn from 'app/core/utils/kbn';
import config from 'app/core/config';
import TimeSeries from 'app/core/time_series2';

class AnnunciatorPanelCtrl extends MetricsPanelCtrl {

    /** @ngInject */
    constructor($scope, $injector, alertSrv) {
        super($scope, $injector);

        this.alertSrv = alertSrv;

        var panelDefaults = {
            "LowerLimit": {
                "DisplayOption": "disabled",
                "Color": "rgb(2, 17, 249)",
                "Value": "20",
                "Decimals": "1",
                "FontSize": "50%"
            },
            "LowerWarning": {
                "DisplayOption": "disabled",
                "Color": "rgb(9, 115, 102)",
                "Value": "25"
            },
            "Metric": {
                "Name": "current",
                "Format": "percent",
                "Color": "rgb(2, 247, 2)",
                "Decimals": "4",
                "FontSize": "100%"
            },
            "UpperWarning": {
                "DisplayOption": "disabled",
                "Color": "rgb(247, 2, 2)",
                "Value": "75"
            },
            "UpperLimit": {
                "DisplayOption": "disabled",
                "Color": "rgb(247, 90, 7)",
                "Value": "80",
                "Decimals": "2",
                "FontSize": "50%"
            },
            "Prefix": {
                "Text": "",
                "FontSize": "hide",
            },
            "Postfix": {
                "Text": "",
                "FontSize": "hide",
            },
            "sparkline": {
                "fillColor": "rgba(19, 193, 91, 0.32)",
                "full": false,
                "lineColor": "rgb(145, 200, 16)",
                "show": true
            }
        };

        var panel = {};
        var elem = {};
        var ctrl = {};

        _.defaults(this.panel, panelDefaults);

        this.events.on('render', this.onRender.bind(this));
        this.events.on('data-received', this.onDataReceived.bind(this));
        this.events.on('data-error', this.onDataError.bind(this));
        this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    }

    onDataError(err) {
        this.alertSrv.set('Annunciator Data Error', err, 'error', 5000);
        this.seriesList = [];
        this.render([]);
    }

    onInitEditMode() {
        this.metricNames = ['min', 'max', 'avg', 'current', 'total', 'name', 'first', 'delta', 'diff', 'range'];
        this.fontSizes = ['20%', '30%', '50%', '70%', '80%', '100%', '110%', '120%', '150%', '170%', '200%'];
        this.fontSizes0 = ['hide'].concat(this.fontSizes);
        this.displayStates = ['disabled', 'static', 'flash'];
        this.unitFormats = kbn.getUnitFormats();
        this.addEditorTab('Options', 'public/plugins/michaeldmoore-annunciator-panel/options.html', 2);
    }

    setUnitFormat(subItem) {
        this.panel.Metric.Format = subItem.value;
        this.render();
    }

    getValueRegion(value) {
        var valueRegion = "OK";

        if (this.panel.UpperLimit.DisplayOption != 'disabled') {
            if (value >= this.panel.UpperLimit.Value)
                valueRegion = "UpperLimit";
            else if (this.panel.UpperWarning.DisplayOption != 'disabled' && (value >= this.panel.UpperWarning.Value))
                valueRegion = "UpperWarning";
        }

        if (this.panel.LowerLimit.DisplayOption != 'disabled') {
            if (value <= this.panel.LowerLimit.Value)
                valueRegion = "LowerLimit";
            else if (this.panel.LowerWarning.DisplayOption != 'disabled' && (value <= this.panel.LowerWarning.Value))
                valueRegion = "LowerWarning";
        }

        return valueRegion;
    }

    getDisplayAttributesForValue(value, metric) {
        var displayAttributes = {};
        var color = this.panel.Metric.Color;
        var flash = false;

        var valueRegion = this.getValueRegion(this.data.value);
        switch (valueRegion) {
            case "UpperLimit":
                color = this.panel.UpperLimit.Color;
                break;

            case "UpperWarning":
                color = this.panel.UpperWarning.Color;
                break;

            case "LowerWarning":
                color = this.panel.LowerWarning.Color;
                break;

            case "LowerLimit":
                color = this.panel.LowerLimit.Color;
                break;
        }

        switch (metric) {
            case "UpperLimit":
                color = this.panel.UpperLimit.Color;
                break;

                //case "UpperWarning": 
                //color = this.panel.UpperWarning.Color; 
                //break;

                //case "LowerWarning":
                //color = this.panel.LowerWarning.Color; 
                //break;

            case "LowerLimit":
                color = this.panel.LowerLimit.Color;
                break;
        }

        flash = ((valueRegion == "UpperLimit" && this.panel.UpperLimit.DisplayOption == "flash" && (metric == "Value" || metric == "UpperLimit")) ||
            (valueRegion == "LowerLimit" && this.panel.LowerLimit.DisplayOption == "flash" && (metric == "Value" || metric == "LowerLimit")));

        displayAttributes.color = color;
        displayAttributes.flash = flash;

        return displayAttributes;
    }

    buildValueHtml() {
        var html = '';

        html += "<div class='michaeldmoore-annunciator-panel-value-container'>";
        if (this.panel.Prefix.Text != '' && this.panel.Prefix.FontSize != 'hide')
            html += this.getTextSpan('michaeldmoore-annunciator-panel-prefix', this.panel.Prefix.FontSize, '', this.panel.Prefix.Text, false);

        html += this.getValueSpan('michaeldmoore-annunciator-panel-value', this.panel.Metric.FontSize, this.panel.Metric.Decimals, this.data.value, "Value");

        if (this.panel.Postfix.Text != '' && this.panel.Postfix.FontSize != 'hide')
            html += this.getTextSpan('michaeldmoore-annunciator-panel-postfix', this.panel.Postfix.FontSize, '', this.panel.Postfix.Text, false);

        html += "</div>";

        return html;
    }

    buildLimitsHtml() {
        var html = '';

        if (this.panel.UpperLimit.DisplayOption != 'disabled' || this.panel.LowerLimit.DisplayOption != 'disabled') {
            html += "<div class='michaeldmoore-annunciator-panel-limits-container'>";

            if (this.panel.LowerLimit.DisplayOption != 'disabled' && (this.panel.LowerLimit.FontSize != 'hide'))
                html += this.getValueSpan('michaeldmoore-annunciator-panel-lower-limit', this.panel.LowerLimit.FontSize, this.panel.LowerLimit.Decimals, this.panel.LowerLimit.Value, "LowerLimit");

            if (this.panel.UpperLimit.DisplayOption != 'disabled' && (this.panel.UpperLimit.FontSize != 'hide'))
                html += this.getValueSpan('michaeldmoore-annunciator-panel-upper-limit', this.panel.UpperLimit.FontSize, this.panel.UpperLimit.Decimals, this.panel.UpperLimit.Value, "UpperLimit");

            html += "</div>";

            html += "<div style='float:none;'/>";
        }
        return html;
    }

    buildHtml() {
        var html = "<div class='michaeldmoore-annunciator-panel-container' style='height:" + this.ctrl.height + "px;'>";

        if (this.data != null && this.data.value != null) {
            if ($.isNumeric(this.data.value)) {
                html += this.buildLimitsHtml();
                html += this.buildValueHtml();
            } else
                this.alertSrv.set('Annunciator Data Warning', 'Last data point is non-numeric', 'warning', 5000);
        } else
            this.alertSrv.set('Annunciator Data Warning', 'Last data point is null', 'info', 1000);

        html += "</div>";

        this.elem.html(html);

        if (this.panel.sparkline.show) {
            this.addSparkline();
        }
    }

    getTextSpan(className, fontSize, color, text, flash) {
        var style = '';

        if (fontSize)
            style += "font-size:" + fontSize + ";";

        if (color)
            style += "color:" + color + ";";

        if (style)
            style = ' style="' + style + '"';

        if (flash)
            className += " michaeldmoore-annunciator-flash";

        return '<span class="' + className + '"' + style + '>' + text + '</span>';
    }

    getValueSpan(className, fontSize, decimals, value, metric) {
        var displayAttributes = this.getDisplayAttributesForValue(value, metric);
        return this.getTextSpan(className, fontSize, displayAttributes.color, this.formatValue(value, decimals), displayAttributes.flash);
    }

    setOKValueRange() {
        var OKLowerLimit;
        if (this.panel.LowerLimit.DisplayOption != 'disabled') {
            if ($.isNumeric(this.panel.LowerLimit.Value)) {
                if (this.panel.LowerWarning.DisplayOption != 'disabled') {
                    if ($.isNumeric(this.panel.LowerWarning.Value))
                        if (this.panel.LowerWarning.Value > this.panel.LowerLimit.Value)
                            OKLowerLimit = this.panel.LowerWarning.Value;
                        else
                            this.alertSrv.set('Annunciator Options Error', 'LowerWarning Value should be greater than LowerLimit Value', 'error', 5000);
                    else
                        this.alertSrv.set('Annunciator Options Error', 'LowerWarning Value is non-numeric', 'error', 5000);
                } else
                    OKLowerLimit = this.panel.LowerLimit.Value;
            } else {
                this.alertSrv.set('Annunciator Options Error', 'LowerLimit Value is non-numeric', 'error', 5000);
            }
        }

        var OKUpperLimit;
        if (this.panel.UpperLimit.DisplayOption != 'disabled') {
            if ($.isNumeric(this.panel.UpperLimit.Value)) {
                if (this.panel.UpperWarning.DisplayOption != 'disabled') {
                    if ($.isNumeric(this.panel.UpperWarning.Value))
                        if (this.panel.UpperWarning.Value < this.panel.UpperLimit.Value)
                            OKUpperLimit = this.panel.UpperWarning.Value;
                        else
                            this.alertSrv.set('Annunciator Options Error', 'UpperWarning Value should be less than UpperLimit Value', 'error', 5000);
                    else
                        this.alertSrv.set('Annunciator Options Error', 'UpperWarning Value is non-numeric', 'error', 5000);
                } else
                    OKUpperLimit = this.panel.UpperLimit.Value;
            } else {
                this.alertSrv.set('Annunciator Options Error', 'UpperLimit Value is non-numeric', 'error', 5000);
            }
        }

        if ($.isNumeric(OKLowerLimit) && $.isNumeric(OKUpperLimit))
            this.panel.MetricValueRange = OKLowerLimit + ' -> ' + OKUpperLimit;
        else if ($.isNumeric(OKLowerLimit))
            this.panel.MetricValueRange = '> ' + OKLowerLimit;
        else if ($.isNumeric(OKUpperLimit))
            this.panel.MetricValueRange = '< ' + OKUpperLimit;
        else
            this.panel.MetricValueRange = '';
    }

    onRender() {
        this.buildHtml();
        this.setOKValueRange();
        this.ctrl.renderingCompleted();
    }


    onDataReceived(dataList) {
        var data = {};
        if (dataList.length > 0) {
            var dataPoints = dataList[0].datapoints;
            if (dataPoints.length < 2) {
                this.alertSrv.set('Annunciator Data Error', 'No data', 'error', 5000);
            } else {
                this.series = dataList.map(this.seriesHandler.bind(this));
                this.setValues(data);
            }
        }
        this.data = data;
        this.render();
    }

    seriesHandler(seriesData) {
        var series = new TimeSeries({
            datapoints: seriesData.datapoints,
            alias: seriesData.target,
        });

        series.flotpairs = series.getFlotPairs(this.panel.nullPointMode);
        return series;
    }

    getDecimalsForValue(value, decimals) {
        if (_.isNumber(decimals)) {
            return {
                decimals: decimals,
                scaledDecimals: null
            };
        }

        var delta = value / 2;
        var dec = -Math.floor(Math.log(delta) / Math.LN10);

        var magn = Math.pow(10, -dec),
            norm = delta / magn, // norm is between 1.0 and 10.0
            size;

        if (norm < 1.5) {
            size = 1;
        } else if (norm < 3) {
            size = 2;
            // special case for 2.5, requires an extra decimal
            if (norm > 2.25) {
                size = 2.5;
                ++dec;
            }
        } else if (norm < 7.5) {
            size = 5;
        } else {
            size = 10;
        }

        size *= magn;

        // reduce starting decimals if not needed
        if (Math.floor(value) === value) {
            dec = 0;
        }

        var result = {};
        result.decimals = Math.max(0, dec);
        result.scaledDecimals = result.decimals - Math.floor(Math.log(size) / Math.LN10) + 2;

        return result;
    }

    formatValue(value, decimals) {
        // crude work-around for kbn formatting function error - preserve decimal places even for whole numbers
        if (value == 0 && decimals > 0)
            value += 0.000000000000001;
        var decimalInfo = this.getDecimalsForValue(value, decimals);
        var formatFunc = kbn.valueFormats[this.panel.Metric.Format];
        return formatFunc(value, decimalInfo.decimals, decimalInfo.scaledDecimals);
    }

    setValues(data) {
        data.flotpairs = [];

        if (this.series.length > 1) {
            this.alertSrv.set('Annunciator Multiple Series Error',
                'Metric query returns ' + this.series.length + ' series. Annunciator Panel expects a single series.\n\nResponse:\n' + JSON.stringify(this.series), 'error', 10000);
            //var error = new Error();
            //error.message = 'Multiple Series Error';
            //error.data = 'Metric query returns ' + this.series.length + ' series. Annunciator Panel expects a single series.\n\nResponse:\n' + JSON.stringify(this.series);
            //throw error;			
        }

        if (this.series && this.series.length > 0) {
            var lastPoint = _.last(this.series[0].datapoints);
            var lastValue = _.isArray(lastPoint) ? lastPoint[0] : null;

            if (this.panel.Metric.Name === 'name') {
                data.value = 0;
                data.valueRounded = 0;
                data.valueFormatted = this.series[0].alias;
            } else if (_.isString(lastValue)) {
                data.value = 0;
                data.valueFormatted = _.escape(lastValue);
                data.valueRounded = 0;
            } else {
                data.value = this.series[0].stats[this.panel.Metric.Name];
                data.flotpairs = this.series[0].flotpairs;

                if (data == null || data.value == null) {
                    data.value = 0.0;
                }

                var decimalInfo = this.getDecimalsForValue(data.value, this.panel.Metric.Decimals);
                var formatFunc = kbn.valueFormats[this.panel.Metric.Format];
                data.valueFormatted = formatFunc(data.value, decimalInfo.decimals, decimalInfo.scaledDecimals);
                data.valueRounded = kbn.roundValue(data.value, decimalInfo.decimals);
            }

            if (data == null || data.value == null) {
                data.value = 0.0;
            }

            // Add $__name variable for using in prefix or postfix
            data.scopedVars = _.extend({}, this.panel.scopedVars);
            data.scopedVars["__name"] = {
                value: this.series[0].label
            };
        }
    }

    addSparkline() {
        if (this.elem == null || this.elem.width() < 10) {
            // element has not gotten it's width yet
            // delay sparkline render
            setTimeout(this.addSparkline, 30);
            return;
        }

        var width = this.elem.width() + 20;
        var height = this.ctrl.height;
        var plotCanvas = $('<div></div>');
        var plotCss = {};
        plotCss.position = 'absolute';

        if (this.panel.sparkline.full) {
            plotCss.bottom = '5px';
            plotCss.left = '-5px';
            plotCss.width = (width - 10) + 'px';
            var dynamicHeightMargin = height <= 100 ? 5 : (Math.round((height / 100)) * 15) + 5;
            plotCss.height = (height - dynamicHeightMargin) + 'px';
        } else {
            plotCss.bottom = "0px";
            plotCss.left = "-5px";
            plotCss.width = (width - 10) + 'px';
            plotCss.height = Math.floor(height * 0.25) + 'px';
        }

        plotCanvas.css(plotCss);

        var options = {
            legend: {
                show: false
            },
            series: {
                lines: {
                    show: true,
                    fill: 1,
                    lineWidth: 1,
                    fillColor: this.panel.sparkline.fillColor,
                },
            },
            yaxes: {
                show: false
            },
            xaxis: {
                show: false,
                mode: "time",
                min: this.ctrl.range.from.valueOf(),
                max: this.ctrl.range.to.valueOf(),
            },
            grid: {
                hoverable: false,
                show: false
            },
        };

        this.elem.find('.michaeldmoore-annunciator-panel-container').append(plotCanvas);

        var plotSeries = {
            data: this.data.flotpairs,
            color: this.panel.sparkline.lineColor
        };

        $.plot(plotCanvas, [plotSeries], options);
    }

    onConfigChanged() {
        this.refresh();
    }

    link(scope, elem, attrs, ctrl) {
        this.ctrl = ctrl;
        this.elem = elem.find('.panel-content');
    }
}

AnnunciatorPanelCtrl.templateUrl = 'module.html';

export {
    AnnunciatorPanelCtrl as PanelCtrl
};
