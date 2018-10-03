///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register([], function(exports_1) {
    var AppConfigCtrl;
    return {
        setters:[],
        execute: function() {
            AppConfigCtrl = (function () {
                function AppConfigCtrl(datasourceSrv, backendSrv, $q) {
                    this.datasourceSrv = datasourceSrv;
                    this.backendSrv = backendSrv;
                    this.$q = $q;
                    this.appEditCtrl.setPostUpdateHook(this.postUpdate.bind(this));
                    this.getDsConfig();
                }
                AppConfigCtrl.prototype.getDsConfig = function () {
                    var _this = this;
                    this.dsConfig = {
                        name: 'Moogsoft AIOps',
                        type: 'moogsoft-aiops-datasource',
                        url: '',
                        access: 'proxy',
                        basicAuth: true,
                        withCredentials: true,
                        jsonData: { tlsSkipVerify: true },
                        secureJsonFields: {},
                    };
                    if (!this.appModel.enabled) {
                        return;
                    }
                    return this.backendSrv.get('/api/datasources').then(function (res) {
                        for (var _i = 0; _i < res.length; _i++) {
                            var ds = res[_i];
                            if (ds.type === _this.dsConfig.type && ds.name === _this.dsConfig.name) {
                                return _this.backendSrv.get("/api/datasources/" + ds.id).then(function (ds) {
                                    _this.dsConfig = ds;
                                    _this.testDatasource();
                                });
                            }
                        }
                    });
                };
                AppConfigCtrl.prototype.testDatasource = function () {
                    var _this = this;
                    this.datasourceSrv.get(this.dsConfig.name).then(function (instance) {
                        instance
                            .testDatasource()
                            .then(function (result) {
                            _this.testRes = { status: result.status, message: result.message };
                        })
                            .catch(function (err) {
                            _this.testRes = { status: 'error', message: 'HTTP Error ' + (err.statusText || err.message) };
                        });
                    });
                };
                AppConfigCtrl.prototype.removeDatasource = function () {
                    if (this.dsConfig.id) {
                        return this.backendSrv.delete("/api/datasources/" + this.dsConfig.id);
                    }
                };
                AppConfigCtrl.prototype.postUpdate = function () {
                    var promise;
                    if (!this.appModel.enabled) {
                        return this.removeDatasource();
                    }
                    if (this.dsConfig.id) {
                        promise = this.backendSrv.put("/api/datasources/" + this.dsConfig.id, this.dsConfig);
                    }
                    else {
                        promise = this.backendSrv.post("/api/datasources", this.dsConfig);
                    }
                    return promise;
                };
                AppConfigCtrl.templateUrl = 'partials/app.html';
                return AppConfigCtrl;
            })();
            exports_1("AppConfigCtrl", AppConfigCtrl);
        }
    }
});
//# sourceMappingURL=config_ctrl.js.map