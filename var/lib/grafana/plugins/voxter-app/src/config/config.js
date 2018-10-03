import configTemplate from './config.html!text';

class VoxterConfigCtrl {
  constructor($scope, $injector, $q, backendSrv, alertSrv) {
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
      this.getTask().then((exists) => {
        if (!exists) {
          self.appModel.enabled = false;
          self.appModel.jsonData.voxterTokenSet = false;
        }
      });
    } else {
      this.ready = true;
    }
  }

  preUpdate() {
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

  postUpdate() {
    var self = this;
    if (!this.appModel.enabled) {
      this.appModel.jsonData.voxterTokenSet = false;
      return this.stopTask();
    }
    if (!this.voxterToken) {
      return this.$q.resolve();
    }
    // make sure our Api key works.
    return self.ensureTask().then(() => {
      return this.appEditCtrl.importDashboards(); 
    }, () => {
      console.log("failed to add task.");
      self.appModel.enabled = false;
      self.error = "Unable to add collector task. Please try again.";
    });
  }

  getTask() {
    var self = this;
    var query = {metric: "/raintank/apps/voxter/*"};
    return this.backendSrv.get("api/plugin-proxy/voxter-app/tasks", query).then((resp) => {
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
    }, (resp) => {
      if (resp.status === 401) {
        self.appModel.jsonData.voxterTokenSet = false;
        self.appModel.jsonData.gnetTokenSet = false;
        self.appModel.enabled = false;
      }
    });
  }

  ensureTask() {
    var self = this;
    if (!this.voxterToken) {
      return this.$q.reject("voxter token not set.");
    }
    var taskName = "voxter-metrics";
    return this.getTask(taskName).then((exists) => {
      if (exists) {
        console.log("tasks exists");
        self.taskStatus = "Task exists.";
        return;
      }
      console.log("creating task.");
      var task = {
        "name": taskName,
        "metrics": {"/raintank/apps/voxter/*":0},
        "config": {
          "/raintank/apps/voxter": {
            "voxter_key": self.voxterToken
          }
        },
        "interval": 60,
        "route": { "type": "any"},
        "enabled": true
      };

      return self.backendSrv.post("api/plugin-proxy/voxter-app/tasks", task).then((resp) => {
        this.task = resp.body;
        self.taskStatus = "Task exists.";
        console.log("task created.");
      });
    });
  }

  stopTask() {
    this.appModel.jsonData.voxterTokenSet=false;
    if (!this.task) {
      console.log("unknown task name.");
      return;
    }
    return this.backendSrv.delete("api/plugin-proxy/voxter-app/tasks/"+this.task.id).then((resp) => {
      this.task = {};
      this.taskStatus = "Task not found.";
    });
  }

  initDatasource() {
    var self = this;
    //check for existing datasource.
    return self.backendSrv.get('api/datasources').then(function(results) {
      var foundGraphite = false;
      var foundElastic = false;
      _.forEach(results, function(ds) {
        if (foundGraphite && foundElastic) { return; }
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
}

VoxterConfigCtrl.template = configTemplate;

export {
  VoxterConfigCtrl as ConfigCtrl
};

