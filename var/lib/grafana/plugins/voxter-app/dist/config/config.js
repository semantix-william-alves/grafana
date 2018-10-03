"use strict";

System.register(["./config.html!text"], function (_export, _context) {
  "use strict";

  var configTemplate, _createClass, VoxterConfigCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_configHtmlText) {
      configTemplate = _configHtmlText.default;
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

      _export("ConfigCtrl", VoxterConfigCtrl = function () {
        function VoxterConfigCtrl($scope, $injector, $q, backendSrv, alertSrv) {
          _classCallCheck(this, VoxterConfigCtrl);

          this.$q = $q;
          this.backendSrv = backendSrv;
          this.alertSrv = alertSrv;
          this.$scope = $scope;
          this.appModel.secureJsonData = {};
          if (this.appModel.jsonData === null) {
            this.appModel.jsonData = {
              gnetTokenSet: false,
              voxterTokenSet: false
            };
          }
          this.voxterToken = "";
          this.taskStatus = "Task status unknown";
          this.task = {};
          this.error = false;
          this.appEditCtrl.setPreUpdateHook(this.preUpdate.bind(this));
          this.appEditCtrl.setPostUpdateHook(this.postUpdate.bind(this));
          this.ready = false;
          var self = this;
          if (this.appModel.enabled) {
            this.getTask().then(function (exists) {
              if (!exists) {
                self.appModel.enabled = false;
                self.appModel.jsonData.voxterTokenSet = false;
              }
            });
          } else {
            this.ready = true;
          }
        }

        _createClass(VoxterConfigCtrl, [{
          key: "preUpdate",
          value: function preUpdate() {
            if (!this.appModel.enabled) {
              return this.$q.resolve();
            }
            if (this.appModel.secureJsonData.gnet_token) {
              console.log("gnet token is set.");
              this.appModel.jsonData.gnetTokenSet = true;
            }
            if (this.voxterToken) {
              console.log("voxter token is set.");
              this.appModel.jsonData.voxterTokenSet = true;
            }

            if (!this.appModel.jsonData.gnetTokenSet || !this.appModel.jsonData.voxterTokenSet) {
              console.log("both gNet key and voxter key need to be set");
              return this.$q.reject("grafana.net apiKey and voxter apiKey need to be set");
            }

            return this.initDatasource();
          }
        }, {
          key: "postUpdate",
          value: function postUpdate() {
            var _this = this;

            var self = this;
            if (!this.appModel.enabled) {
              this.appModel.jsonData.voxterTokenSet = false;
              return this.stopTask();
            }
            if (!this.voxterToken) {
              return this.$q.resolve();
            }
            // make sure our Api key works.
            return self.ensureTask().then(function () {
              return _this.appEditCtrl.importDashboards();
            }, function () {
              console.log("failed to add task.");
              self.appModel.enabled = false;
              self.error = "Unable to add collector task. Please try again.";
            });
          }
        }, {
          key: "getTask",
          value: function getTask() {
            var self = this;
            var query = { metric: "/raintank/apps/voxter/*" };
            return this.backendSrv.get("api/plugin-proxy/voxter-app/tasks", query).then(function (resp) {
              if (resp.meta.code !== 200) {
                self.alertSrv.set("failed to get task", resp.meta.message, 'error', 10000);
                return false;
              }
              self.ready = true;
              if (resp.body.length > 0) {
                self.task = resp.body[0];
                return true;
              } else {
                return false;
              }
            }, function (resp) {
              if (resp.status === 401) {
                self.appModel.jsonData.voxterTokenSet = false;
                self.appModel.jsonData.gnetTokenSet = false;
                self.appModel.enabled = false;
              }
            });
          }
        }, {
          key: "ensureTask",
          value: function ensureTask() {
            var _this2 = this;

            var self = this;
            if (!this.voxterToken) {
              return this.$q.reject("voxter token not set.");
            }
            var taskName = "voxter-metrics";
            return this.getTask(taskName).then(function (exists) {
              if (exists) {
                console.log("tasks exists");
                self.taskStatus = "Task exists.";
                return;
              }
              console.log("creating task.");
              var task = {
                "name": taskName,
                "metrics": { "/raintank/apps/voxter/*": 0 },
                "config": {
                  "/raintank/apps/voxter": {
                    "voxter_key": self.voxterToken
                  }
                },
                "interval": 60,
                "route": { "type": "any" },
                "enabled": true
              };

              return self.backendSrv.post("api/plugin-proxy/voxter-app/tasks", task).then(function (resp) {
                _this2.task = resp.body;
                self.taskStatus = "Task exists.";
                console.log("task created.");
              });
            });
          }
        }, {
          key: "stopTask",
          value: function stopTask() {
            var _this3 = this;

            this.appModel.jsonData.voxterTokenSet = false;
            if (!this.task) {
              console.log("unknown task name.");
              return;
            }
            return this.backendSrv.delete("api/plugin-proxy/voxter-app/tasks/" + this.task.id).then(function (resp) {
              _this3.task = {};
              _this3.taskStatus = "Task not found.";
            });
          }
        }, {
          key: "initDatasource",
          value: function initDatasource() {
            var self = this;
            //check for existing datasource.
            return self.backendSrv.get('api/datasources').then(function (results) {
              var foundGraphite = false;
              var foundElastic = false;
              _.forEach(results, function (ds) {
                if (foundGraphite && foundElastic) {
                  return;
                }
                if (ds.name === "raintank") {
                  foundGraphite = true;
                }
                if (ds.name === "raintankEvents") {
                  foundElastic = true;
                }
              });
              var promises = [];
              if (!foundGraphite) {
                // create datasource.
                var graphite = {
                  name: 'raintank',
                  type: 'graphite',
                  url: 'api/plugin-proxy/voxter-app/graphite',
                  access: 'direct',
                  jsonData: {}
                };
                promises.push(self.backendSrv.post('api/datasources', graphite));
              }
              if (!foundElastic) {
                // create datasource.
                var elastic = {
                  name: 'raintankEvents',
                  type: 'elasticsearch',
                  url: 'api/plugin-proxy/voxter-app/elasticsearch',
                  access: 'direct',
                  database: '[events-]YYYY-MM-DD',
                  jsonData: {
                    esVersion: 1,
                    interval: "Daily",
                    timeField: "timestamp"
                  }
                };
                promises.push(self.backendSrv.post('api/datasources', elastic));
              }
              return Promise.all(promises);
            });
          }
        }]);

        return VoxterConfigCtrl;
      }());

      VoxterConfigCtrl.template = configTemplate;

      _export("ConfigCtrl", VoxterConfigCtrl);
    }
  };
});
//# sourceMappingURL=config.js.map
