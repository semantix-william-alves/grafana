'use strict';

System.register(['app/plugins/sdk', './graphite_src/add_graphite_func', './graphite_src/func_editor', 'moment', './graphite_src/gfunc', './graphite_src/parser'], function (_export, _context) {
    "use strict";

    var QueryCtrl, moment, gfunc, Parser, _createClass, BluefloodDatasourceQueryCtrl;

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
        }, function (_graphite_srcAdd_graphite_func) {}, function (_graphite_srcFunc_editor) {}, function (_moment) {
            moment = _moment.default;
        }, function (_graphite_srcGfunc) {
            gfunc = _graphite_srcGfunc.default;
        }, function (_graphite_srcParser) {
            Parser = _graphite_srcParser.Parser;
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

            _export('BluefloodDatasourceQueryCtrl', BluefloodDatasourceQueryCtrl = function (_QueryCtrl) {
                _inherits(BluefloodDatasourceQueryCtrl, _QueryCtrl);

                function BluefloodDatasourceQueryCtrl($scope, $injector, uiSegmentSrv, templateSrv) {
                    _classCallCheck(this, BluefloodDatasourceQueryCtrl);

                    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BluefloodDatasourceQueryCtrl).call(this, $scope, $injector));

                    _this.functions = [];
                    _this.segments = [];
                    _this.uiSegmentSrv = uiSegmentSrv;
                    _this.templateSrv = templateSrv;
                    if (_this.target) {
                        _this.target.target = _this.target.target || '';
                        _this.parseTarget();
                    }
                    return _this;
                }

                _createClass(BluefloodDatasourceQueryCtrl, [{
                    key: 'toggleEditorMode',
                    value: function toggleEditorMode() {
                        this.target.textEditor = !this.target.textEditor;
                        this.parseTarget();
                    }
                }, {
                    key: 'parseTarget',
                    value: function parseTarget() {
                        this.functions = [];
                        this.segments = [];
                        this.error = null;

                        if (this.target.textEditor) {
                            return;
                        }

                        var parser = new Parser(this.target.target);
                        var astNode = parser.getAst();
                        if (astNode === null) {
                            this.checkOtherSegments(0);
                            return;
                        }

                        if (astNode.type === 'error') {
                            this.error = astNode.message + " at position: " + astNode.pos;
                            this.target.textEditor = true;
                            return;
                        }

                        try {
                            this.parseTargeRecursive(astNode, null, 0);
                        } catch (err) {
                            console.log('error parsing target:', err.message);
                            this.error = err.message;
                            this.target.textEditor = true;
                        }

                        this.checkOtherSegments(this.segments.length - 1);
                    }
                }, {
                    key: 'addFunctionParameter',
                    value: function addFunctionParameter(func, value, index, shiftBack) {
                        if (shiftBack) {
                            index = Math.max(index - 1, 0);
                        }
                        func.params[index] = value;
                    }
                }, {
                    key: 'parseTargeRecursive',
                    value: function parseTargeRecursive(astNode, func, index) {
                        var _this2 = this;

                        if (astNode === null) {
                            return null;
                        }

                        switch (astNode.type) {
                            case 'function':
                                var innerFunc = gfunc.createFuncInstance(astNode.name, { withDefaultParams: false });
                                _.each(astNode.params, function (param, index) {
                                    _this2.parseTargeRecursive(param, innerFunc, index);
                                });

                                innerFunc.updateText();
                                this.functions.push(innerFunc);
                                break;
                            case 'series-ref':
                                this.addFunctionParameter(func, astNode.value, index, this.segments.length > 0);
                                break;
                            case 'bool':
                            case 'string':
                            case 'number':
                                if (index - 1 >= func.def.params.length) {
                                    throw { message: 'invalid number of parameters to method ' + func.def.name };
                                }
                                this.addFunctionParameter(func, astNode.value, index, true);
                                break;
                            case 'metric':
                                if (this.segments.length > 0) {
                                    if (astNode.segments.length !== 1) {
                                        throw { message: 'Multiple metric params not supported, use text editor.' };
                                    }
                                    this.addFunctionParameter(func, astNode.segments[0].value, index, true);
                                    break;
                                }

                                this.segments = _.map(astNode.segments, function (segment) {
                                    return _this2.uiSegmentSrv.newSegment(segment);
                                });
                        }
                    }
                }, {
                    key: 'getSegmentPathUpTo',
                    value: function getSegmentPathUpTo(index) {
                        var arr = this.segments.slice(0, index);

                        return _.reduce(arr, function (result, segment) {
                            return result ? result + "." + segment.value : segment.value;
                        }, "");
                    }
                }, {
                    key: 'checkOtherSegments',
                    value: function checkOtherSegments(fromIndex) {
                        var _this3 = this;

                        if (fromIndex === 0) {
                            this.segments.push(this.uiSegmentSrv.newSelectMetric());
                            return;
                        }

                        var path = this.getSegmentPathUpTo(fromIndex + 1);
                        return this.datasource.metricFindQuery(path).then(function (segments) {
                            if (segments.length === 0) {
                                if (path !== '') {
                                    _this3.segments = _this3.segments.splice(0, fromIndex);
                                    _this3.segments.push(_this3.uiSegmentSrv.newSelectMetric());
                                }
                            } else if (segments[0].expandable) {
                                if (_this3.segments.length === fromIndex) {
                                    _this3.segments.push(_this3.uiSegmentSrv.newSelectMetric());
                                } else {
                                    return _this3.checkOtherSegments(fromIndex + 1);
                                }
                            }
                        }).catch(function (err) {
                            _this3.error = err.message || 'Failed to issue metric query';
                        });
                    }
                }, {
                    key: 'setSegmentFocus',
                    value: function setSegmentFocus(segmentIndex) {
                        _.each(this.segments, function (segment, index) {
                            segment.focus = segmentIndex === index;
                        });
                    }
                }, {
                    key: 'wrapFunction',
                    value: function wrapFunction(target, func) {
                        return func.render(target);
                    }
                }, {
                    key: 'getAltSegments',
                    value: function getAltSegments(index) {
                        var _this4 = this;

                        var query = index === 0 ? '*' : this.getSegmentPathUpTo(index) + '.*';

                        return this.datasource.metricFindQuery(query).then(function (segments) {
                            var altSegments = _.map(segments, function (segment) {
                                return _this4.uiSegmentSrv.newSegment({ value: segment.text, expandable: segment.expandable });
                            });

                            if (altSegments.length === 0) {
                                return altSegments;
                            }

                            // add template variables
                            _.each(_this4.templateSrv.variables, function (variable) {
                                altSegments.unshift(_this4.uiSegmentSrv.newSegment({
                                    type: 'template',
                                    value: '$' + variable.name,
                                    expandable: true
                                }));
                            });

                            // add wildcard option
                            altSegments.unshift(_this4.uiSegmentSrv.newSegment('*'));
                            return altSegments;
                        }).catch(function (err) {
                            _this4.error = err.message || 'Failed to issue metric query';
                            return [];
                        });
                    }
                }, {
                    key: 'segmentValueChanged',
                    value: function segmentValueChanged(segment, segmentIndex) {
                        var _this5 = this;

                        this.error = null;

                        if (this.functions.length > 0 && this.functions[0].def.fake) {
                            this.functions = [];
                        }

                        if (segment.expandable) {
                            return this.checkOtherSegments(segmentIndex + 1).then(function () {
                                _this5.setSegmentFocus(segmentIndex + 1);
                                _this5.targetChanged();
                            });
                        } else {
                            this.segments = this.segments.splice(0, segmentIndex + 1);
                        }

                        this.setSegmentFocus(segmentIndex + 1);
                        this.targetChanged();
                    }
                }, {
                    key: 'targetTextChanged',
                    value: function targetTextChanged() {
                        this.parseTarget();
                        this.panelCtrl.refresh();
                    }
                }, {
                    key: 'targetChanged',
                    value: function targetChanged() {
                        if (this.error) {
                            return;
                        }

                        var oldTarget = this.target.target;
                        var target = this.getSegmentPathUpTo(this.segments.length);
                        this.target.target = _.reduce(this.functions, this.wrapFunction, target);

                        if (this.target.target !== oldTarget) {
                            if (this.segments[this.segments.length - 1].value !== 'select metric') {
                                this.panelCtrl.refresh();
                            }
                        }
                    }
                }, {
                    key: 'removeFunction',
                    value: function removeFunction(func) {
                        this.functions = _.without(this.functions, func);
                        this.targetChanged();
                    }
                }, {
                    key: 'addFunction',
                    value: function addFunction(funcDef) {
                        var newFunc = gfunc.createFuncInstance(funcDef, { withDefaultParams: true });
                        newFunc.added = true;
                        this.functions.push(newFunc);

                        this.moveAliasFuncLast();
                        this.smartlyHandleNewAliasByNode(newFunc);

                        if (this.segments.length === 1 && this.segments[0].fake) {
                            this.segments = [];
                        }

                        if (!newFunc.params.length && newFunc.added) {
                            this.targetChanged();
                        }
                    }
                }, {
                    key: 'moveAliasFuncLast',
                    value: function moveAliasFuncLast() {
                        var aliasFunc = _.find(this.functions, function (func) {
                            return func.def.name === 'alias' || func.def.name === 'aliasByNode' || func.def.name === 'aliasByMetric';
                        });

                        if (aliasFunc) {
                            this.functions = _.without(this.functions, aliasFunc);
                            this.functions.push(aliasFunc);
                        }
                    }
                }, {
                    key: 'smartlyHandleNewAliasByNode',
                    value: function smartlyHandleNewAliasByNode(func) {
                        if (func.def.name !== 'aliasByNode') {
                            return;
                        }

                        for (var i = 0; i < this.segments.length; i++) {
                            if (this.segments[i].value.indexOf('*') >= 0) {
                                func.params[0] = i;
                                func.added = false;
                                this.targetChanged();
                                return;
                            }
                        }
                    }
                }]);

                return BluefloodDatasourceQueryCtrl;
            }(QueryCtrl));

            _export('BluefloodDatasourceQueryCtrl', BluefloodDatasourceQueryCtrl);

            BluefloodDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
        }
    };
});
//# sourceMappingURL=query_ctrl.js.map
