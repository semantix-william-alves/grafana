'use strict';

System.register(['app/plugins/sdk', 'lodash'], function (_export, _context) {
  "use strict";

  var QueryCtrl, _, _createClass, SnapQueryCtrl;

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
    }, function (_lodash) {
      _ = _lodash.default;
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

      _export('SnapQueryCtrl', SnapQueryCtrl = function (_QueryCtrl) {
        _inherits(SnapQueryCtrl, _QueryCtrl);

        function SnapQueryCtrl($scope, $injector, uiSegmentSrv) {
          _classCallCheck(this, SnapQueryCtrl);

          var _this = _possibleConstructorReturn(this, (SnapQueryCtrl.__proto__ || Object.getPrototypeOf(SnapQueryCtrl)).call(this, $scope, $injector));

          _this.uiSegmentSrv = uiSegmentSrv;
          _this.removeMetricOption = _this.uiSegmentSrv.newSegment({ fake: true, value: '-- remove metric --' });

          _this.target.taskName = _this.target.taskName || 'select task';
          _this.target.taskId = _this.target.taskId || '';
          _this.target.metrics = _this.target.metrics || [];
          _this.target.interval = _this.target.interval || '1s';

          _this.taskSegment = _this.uiSegmentSrv.newSegment({
            value: _this.target.taskName,
            cssClass: "tight-form-item-xxlarge"
          });

          if (_this.target.taskName === 'select task') {
            _this.taskSegment.fake = true;
          }

          _this.metricSegments = _this.target.metrics.map(function (item) {
            return _this.uiSegmentSrv.newSegment({ value: item.namespace, cssClass: 'last' });
          });

          _this.metricSegments.push(_this.uiSegmentSrv.newPlusButton());
          _this.getTaskInfo();
          return _this;
        }

        _createClass(SnapQueryCtrl, [{
          key: 'getTasks',
          value: function getTasks() {
            var _this2 = this;

            return this.datasource.getTasks().then(function (tasks) {
              _this2.taskMap = {};

              return tasks.map(function (task) {
                _this2.taskMap[task.name] = task;

                return _this2.uiSegmentSrv.newSegment({ value: task.name });
              });
            });
          }
        }, {
          key: 'taskChanged',
          value: function taskChanged() {
            var task = this.taskMap[this.taskSegment.value];
            if (task) {
              this.target.taskName = task.name;
              this.target.taskId = task.id;
              this.getTaskInfo();
            } else {
              this.target.taskId = '';
              this.target.taskName = this.taskSegment.value;
            }
          }
        }, {
          key: 'getMetricSegments',
          value: function getMetricSegments(segment) {
            var _this3 = this;

            return this.datasource.getMetrics().then(function (metrics) {
              var elements = metrics.map(function (item) {
                return _this3.uiSegmentSrv.newSegment({ value: item.value });
              });

              if (!segment.fake) {
                elements.unshift(_.clone(_this3.removeMetricOption));
              }

              return elements;
            });
          }
        }, {
          key: 'metricSegmentChanged',
          value: function metricSegmentChanged(segment, index) {
            if (segment.value === this.removeMetricOption.value) {
              this.metricSegments.splice(index, 1);
            } else {
              if (segment.type === 'plus-button') {
                segment.type = '';
              }

              if (index + 1 === this.metricSegments.length) {
                this.metricSegments.push(this.uiSegmentSrv.newPlusButton());
              }
            }

            this.target.metrics = this.metricSegments.reduce(function (memo, item) {
              if (!item.fake) {
                memo.push({ namespace: item.value });
              }
              return memo;
            }, []);
          }
        }, {
          key: 'deleteTask',
          value: function deleteTask() {
            var _this4 = this;

            this.datasource.deleteTask(this.target.taskId).then(function () {
              _this4.target.taskId = null;
              _this4.target.taskName = "";
              _this4.taskSegment.value = 'select task';
              _this4.taskSegment.html = 'select task';
              _this4.taskSegment.fake = true;
              _this4.taskNotFound = true;
              _this4.task = null;
              _this4.isRunning = false;
            });
          }
        }, {
          key: 'createTask',
          value: function createTask() {
            var _this5 = this;

            this.datasource.createTask(this.target).then(function (task) {
              _this5.target.taskId = task.id;
              _this5.getTaskInfo();
            });
          }
        }, {
          key: 'getTaskInfo',
          value: function getTaskInfo() {
            var _this6 = this;

            if (!this.target.taskId) {
              this.taskNotFound = true;
              return;
            }

            this.datasource.getTask(this.target.taskId).then(function (task) {
              if (!task) {
                _this6.task = null;
                _this6.target.taskId = '';
                _this6.taskNotFound = true;
                return;
              }
              _this6.taskNotFound = false;
              _this6.task = task;
              _this6.isRunning = task.task_state === 'Running';
              _this6.isStopped = task.task_state === 'Stopped';
            });
          }
        }, {
          key: 'startTask',
          value: function startTask() {
            this.datasource.startTask(this.target.taskId).then(this.getTaskInfo.bind(this));
          }
        }, {
          key: 'stopTask',
          value: function stopTask() {
            this.panelCtrl.dataStream.stop();
            this.datasource.stopTask(this.target.taskId).then(this.getTaskInfo.bind(this));
          }
        }, {
          key: 'watchTask',
          value: function watchTask() {
            this.panelCtrl.dataStream.start();
          }
        }]);

        return SnapQueryCtrl;
      }(QueryCtrl));

      SnapQueryCtrl.templateUrl = 'datasource/query_editor.html';

      _export('SnapQueryCtrl', SnapQueryCtrl);
    }
  };
});
//# sourceMappingURL=query_editor.js.map
