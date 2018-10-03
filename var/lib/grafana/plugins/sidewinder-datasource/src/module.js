import {SidewinderDatasource} from './datasource';
import {SidewinderDatasourceQueryCtrl} from './query_ctrl';

class SidewinderConfigCtrl {}
SidewinderConfigCtrl.templateUrl = 'partials/config.html';

class SidewinderQueryOptionsCtrl {}
SidewinderQueryOptionsCtrl.templateUrl = 'partials/query.options.html';

export {
  SidewinderDatasource as Datasource,
  SidewinderDatasourceQueryCtrl as QueryCtrl,
  SidewinderConfigCtrl as ConfigCtrl,
  SidewinderQueryOptionsCtrl as QueryOptionsCtrl,
};
