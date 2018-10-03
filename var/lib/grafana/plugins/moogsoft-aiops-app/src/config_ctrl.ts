///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import config from 'app/core/config';

export class AppConfigCtrl {
  static templateUrl = 'partials/app.html';

  appEditCtrl: any;
  dsConfig: any;
  appModel: any;
  testRes: any;

  constructor(private datasourceSrv, private backendSrv, private $q) {
    this.appEditCtrl.setPostUpdateHook(this.postUpdate.bind(this));
    this.getDsConfig();
  }

  getDsConfig() {
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

    return this.backendSrv.get('/api/datasources').then(res => {
      for (let ds of res) {
        if (ds.type === this.dsConfig.type && ds.name === this.dsConfig.name) {
          return this.backendSrv.get(`/api/datasources/${ds.id}`).then(ds => {
            this.dsConfig = ds;
            this.testDatasource();
          });
        }
      }
    });
  }

  testDatasource() {
    this.datasourceSrv.get(this.dsConfig.name).then(instance => {
      instance
        .testDatasource()
        .then(result => {
          this.testRes = { status: result.status, message: result.message } ;
        })
        .catch(err => {
          this.testRes = { status: 'error',  message: 'HTTP Error ' + (err.statusText || err.message) };
        });
    });
  }

  removeDatasource() {
    if (this.dsConfig.id) {
      return this.backendSrv.delete(`/api/datasources/${this.dsConfig.id}`);
    }
  }

  postUpdate() {
    let promise;

    if (!this.appModel.enabled) {
      return this.removeDatasource();
    }

    if (this.dsConfig.id) {
      promise = this.backendSrv.put(`/api/datasources/${this.dsConfig.id}`, this.dsConfig);
    } else {
      promise = this.backendSrv.post(`/api/datasources`, this.dsConfig);
    }

    return promise;
  }
}
