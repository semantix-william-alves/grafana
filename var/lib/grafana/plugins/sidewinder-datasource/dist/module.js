'use strict';

System.register(['./datasource', './query_ctrl'], function (_export, _context) {
  "use strict";

  var SidewinderDatasource, SidewinderDatasourceQueryCtrl, SidewinderConfigCtrl, SidewinderQueryOptionsCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_datasource) {
      SidewinderDatasource = _datasource.SidewinderDatasource;
    }, function (_query_ctrl) {
      SidewinderDatasourceQueryCtrl = _query_ctrl.SidewinderDatasourceQueryCtrl;
    }],
    execute: function () {
      _export('ConfigCtrl', SidewinderConfigCtrl = function SidewinderConfigCtrl() {
        _classCallCheck(this, SidewinderConfigCtrl);
      });

      SidewinderConfigCtrl.templateUrl = 'partials/config.html';

      _export('QueryOptionsCtrl', SidewinderQueryOptionsCtrl = function SidewinderQueryOptionsCtrl() {
        _classCallCheck(this, SidewinderQueryOptionsCtrl);
      });

      SidewinderQueryOptionsCtrl.templateUrl = 'partials/query.options.html';

      _export('Datasource', SidewinderDatasource);

      _export('QueryCtrl', SidewinderDatasourceQueryCtrl);

      _export('ConfigCtrl', SidewinderConfigCtrl);

      _export('QueryOptionsCtrl', SidewinderQueryOptionsCtrl);
    }
  };
});
//# sourceMappingURL=module.js.map
