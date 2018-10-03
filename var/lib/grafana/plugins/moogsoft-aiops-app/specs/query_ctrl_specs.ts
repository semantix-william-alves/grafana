import {describe, beforeEach, it, sinon, expect} from './lib/common';
import {MoogsoftQueryCtrl} from '../src/query_ctrl';
import TemplateSrvStub from './lib/template_srv_stub';
import Q from 'q';
import moment from 'moment';

describe('MoogsoftQueryCtrl', function() {
  let queryCtrl;

  beforeEach(function() {
    queryCtrl = new MoogsoftQueryCtrl({}, {}, new TemplateSrvStub());
    queryCtrl.datasource = {$q: Q};
  });

  describe('init query_ctrl variables', function() {
  });

});
