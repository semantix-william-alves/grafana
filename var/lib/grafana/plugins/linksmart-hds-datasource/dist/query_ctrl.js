'use strict';

System.register(['app/plugins/sdk', './css/query-editor.css!'], function (_export, _context) {
  "use strict";

  var QueryCtrl, _createClass, GenericDatasourceQueryCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      QueryCtrl = _appPluginsSdk.QueryCtrl;
    }, function (_cssQueryEditorCss) {}],
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

      _export('GenericDatasourceQueryCtrl', GenericDatasourceQueryCtrl = function (_QueryCtrl) {
        _inherits(GenericDatasourceQueryCtrl, _QueryCtrl);

        function GenericDatasourceQueryCtrl($scope, $injector, uiSegmentSrv) {
          _classCallCheck(this, GenericDatasourceQueryCtrl);

          var _this = _possibleConstructorReturn(this, (GenericDatasourceQueryCtrl.__proto__ || Object.getPrototypeOf(GenericDatasourceQueryCtrl)).call(this, $scope, $injector));

          _this.scope = $scope;
          _this.uiSegmentSrv = uiSegmentSrv;
          _this.target.metric = _this.target.metric || 'select metric';
          _this.target.source = _this.target.source || 'select source';
          // Stored for mapping
          _this.target.UUIDs = _this.target.UUIDs || {};
          _this.target.Legends = _this.target.Legends || {};
          _this.target.Types = _this.target.Types || {};
          _this.target.Aggrs = _this.target.Aggrs || {}; // Aggregations
          return _this;
        }

        _createClass(GenericDatasourceQueryCtrl, [{
          key: 'getOptions',
          value: function getOptions() {
            var that = this;
            return this.datasource.queryMetrics(this.target).then(function (metrics) {
              metrics.forEach(function (m) {
                // Save mappings of uuid, text, legend, and type
                that.target.UUIDs[m.legend] = m.uuid;
                that.target.Legends[m.text] = m.legend;
                that.target.Types[m.legend] = m.type;
              });
              return metrics;
            }).then(this.uiSegmentSrv.transformToSegments(false));
            // Options have to be transformed by uiSegmentSrv to be usable by metric-segment-model directive
          }
        }, {
          key: 'getSources',
          value: function getSources() {
            var that = this;
            return this.datasource.querySources(this.target).then(function (sources) {
              // save a map of source->aggregation ids
              sources.forEach(function (s) {
                that.target.Aggrs[s.text] = {
                  id: s.id,
                  aggregate: s.aggregate
                };
              });
              return sources;
            }, function (rejected) {
              return [];
            }).then(this.uiSegmentSrv.transformToSegments(false));
            // Options have to be transformed by uiSegmentSrv to be usable by metric-segment-model directive
          }
        }, {
          key: 'metricChanged',
          value: function metricChanged() {
            // Change the metric name to legend text: '(shortID) resourceName'
            //  where shortID is the first 4 bytes of the uuid
            // This will be used as DOM's property and graph's legend
            this.target.metric = this.target.Legends[this.target.metric];

            this.panelCtrl.refresh(); // Asks the panel to refresh data.
          }
        }, {
          key: 'sourceChanged',
          value: function sourceChanged() {
            this.panelCtrl.refresh(); // Asks the panel to refresh data.
          }
        }]);

        return GenericDatasourceQueryCtrl;
      }(QueryCtrl));

      _export('GenericDatasourceQueryCtrl', GenericDatasourceQueryCtrl);

      GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
    }
  };
});
//# sourceMappingURL=query_ctrl.js.map
