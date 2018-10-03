'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QueryOptionsCtrl = exports.ConfigCtrl = exports.QueryCtrl = exports.Datasource = undefined;

var _datasource = require('./datasource');

var _query_ctrl = require('./query_ctrl');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SidewinderConfigCtrl = function SidewinderConfigCtrl() {
  _classCallCheck(this, SidewinderConfigCtrl);
};

SidewinderConfigCtrl.templateUrl = 'partials/config.html';

var SidewinderQueryOptionsCtrl = function SidewinderQueryOptionsCtrl() {
  _classCallCheck(this, SidewinderQueryOptionsCtrl);
};

SidewinderQueryOptionsCtrl.templateUrl = 'partials/query.options.html';

exports.Datasource = _datasource.SidewinderDatasource;
exports.QueryCtrl = _query_ctrl.SidewinderDatasourceQueryCtrl;
exports.ConfigCtrl = SidewinderConfigCtrl;
exports.QueryOptionsCtrl = SidewinderQueryOptionsCtrl;
//# sourceMappingURL=module.js.map
