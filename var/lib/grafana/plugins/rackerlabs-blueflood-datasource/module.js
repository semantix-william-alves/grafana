'use strict';

System.register(['./datasource', './query_ctrl'], function (_export, _context) {
    "use strict";

    var BluefloodDatasource, BluefloodDatasourceQueryCtrl, BluefloodConfigCtrl, BluefloodAnnotationsQueryCtrl;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    return {
        setters: [function (_datasource) {
            BluefloodDatasource = _datasource.BluefloodDatasource;
        }, function (_query_ctrl) {
            BluefloodDatasourceQueryCtrl = _query_ctrl.BluefloodDatasourceQueryCtrl;
        }],
        execute: function () {
            _export('ConfigCtrl', BluefloodConfigCtrl = function BluefloodConfigCtrl() {
                _classCallCheck(this, BluefloodConfigCtrl);
            });

            BluefloodConfigCtrl.templateUrl = 'partials/config.html';

            _export('AnnotationsQueryCtrl', BluefloodAnnotationsQueryCtrl = function BluefloodAnnotationsQueryCtrl() {
                _classCallCheck(this, BluefloodAnnotationsQueryCtrl);
            });

            BluefloodAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html';

            _export('Datasource', BluefloodDatasource);

            _export('QueryCtrl', BluefloodDatasourceQueryCtrl);

            _export('ConfigCtrl', BluefloodConfigCtrl);

            _export('AnnotationsQueryCtrl', BluefloodAnnotationsQueryCtrl);
        }
    };
});
//# sourceMappingURL=module.js.map
