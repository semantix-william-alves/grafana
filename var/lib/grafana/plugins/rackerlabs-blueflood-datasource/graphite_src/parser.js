'use strict';

System.register(['./lexer'], function (_export, _context) {
    "use strict";

    var Lexer, _createClass, Parser;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    return {
        setters: [function (_lexer) {
            Lexer = _lexer.Lexer;
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

            _export('Parser', Parser = function () {
                function Parser(expression) {
                    _classCallCheck(this, Parser);

                    this.expression = expression;
                    this.lexer = new Lexer(expression);
                    this.tokens = this.lexer.tokenize();
                    this.index = 0;
                }

                _createClass(Parser, [{
                    key: 'getAst',
                    value: function getAst() {
                        return this.start();
                    }
                }, {
                    key: 'start',
                    value: function start() {
                        try {
                            return this.functionCall() || this.metricExpression();
                        } catch (e) {
                            return {
                                type: 'error',
                                message: e.message,
                                pos: e.pos
                            };
                        }
                    }
                }, {
                    key: 'curlyBraceSegment',
                    value: function curlyBraceSegment() {
                        if (this.match('identifier', '{') || this.match('{')) {

                            var curlySegment = "";

                            while (!this.match('') && !this.match('}')) {
                                curlySegment += this.consumeToken().value;
                            }

                            if (!this.match('}')) {
                                this.errorMark("Expected closing '}'");
                            }

                            curlySegment += this.consumeToken().value;

                            // if curly segment is directly followed by identifier
                            // include it in the segment
                            if (this.match('identifier')) {
                                curlySegment += this.consumeToken().value;
                            }

                            return {
                                type: 'segment',
                                value: curlySegment
                            };
                        } else {
                            return null;
                        }
                    }
                }, {
                    key: 'metricSegment',
                    value: function metricSegment() {
                        var curly = this.curlyBraceSegment();
                        if (curly) {
                            return curly;
                        }

                        if (this.match('identifier') || this.match('number')) {
                            // hack to handle float numbers in metric segments
                            var parts = this.consumeToken().value.split('.');
                            if (parts.length === 2) {
                                this.tokens.splice(this.index, 0, { type: '.' });
                                this.tokens.splice(this.index + 1, 0, { type: 'number', value: parts[1] });
                            }

                            return {
                                type: 'segment',
                                value: parts[0]
                            };
                        }

                        if (!this.match('templateStart')) {
                            this.errorMark('Expected metric identifier');
                        }

                        this.consumeToken();

                        if (!this.match('identifier')) {
                            this.errorMark('Expected identifier after templateStart');
                        }

                        var node = {
                            type: 'template',
                            value: this.consumeToken().value
                        };

                        if (!this.match('templateEnd')) {
                            this.errorMark('Expected templateEnd');
                        }

                        this.consumeToken();
                        return node;
                    }
                }, {
                    key: 'metricExpression',
                    value: function metricExpression() {
                        if (!this.match('templateStart') && !this.match('identifier') && !this.match('number') && !this.match('{')) {
                            return null;
                        }

                        var node = {
                            type: 'metric',
                            segments: []
                        };

                        node.segments.push(this.metricSegment());

                        while (this.match('.')) {
                            this.consumeToken();

                            var segment = this.metricSegment();
                            if (!segment) {
                                this.errorMark('Expected metric identifier');
                            }

                            node.segments.push(segment);
                        }

                        return node;
                    }
                }, {
                    key: 'functionCall',
                    value: function functionCall() {
                        if (!this.match('identifier', '(')) {
                            return null;
                        }

                        var node = {
                            type: 'function',
                            name: this.consumeToken().value
                        };

                        // consume left parenthesis
                        this.consumeToken();

                        node.params = this.functionParameters();

                        if (!this.match(')')) {
                            this.errorMark('Expected closing parenthesis');
                        }

                        this.consumeToken();

                        return node;
                    }
                }, {
                    key: 'boolExpression',
                    value: function boolExpression() {
                        if (!this.match('bool')) {
                            return null;
                        }

                        return {
                            type: 'bool',
                            value: this.consumeToken().value === 'true'
                        };
                    }
                }, {
                    key: 'functionParameters',
                    value: function functionParameters() {
                        if (this.match(')') || this.match('')) {
                            return [];
                        }

                        var param = this.functionCall() || this.numericLiteral() || this.seriesRefExpression() || this.boolExpression() || this.metricExpression() || this.stringLiteral();

                        if (!this.match(',')) {
                            return [param];
                        }

                        this.consumeToken();
                        return [param].concat(this.functionParameters());
                    }
                }, {
                    key: 'seriesRefExpression',
                    value: function seriesRefExpression() {
                        if (!this.match('identifier')) {
                            return null;
                        }

                        var value = this.tokens[this.index].value;
                        if (!value.match(/\#[A-Z]/)) {
                            return null;
                        }

                        var token = this.consumeToken();

                        return {
                            type: 'series-ref',
                            value: token.value
                        };
                    }
                }, {
                    key: 'numericLiteral',
                    value: function numericLiteral() {
                        if (!this.match('number')) {
                            return null;
                        }

                        return {
                            type: 'number',
                            value: parseFloat(this.consumeToken().value)
                        };
                    }
                }, {
                    key: 'stringLiteral',
                    value: function stringLiteral() {
                        if (!this.match('string')) {
                            return null;
                        }

                        var token = this.consumeToken();
                        if (token.isUnclosed) {
                            throw { message: 'Unclosed string parameter', pos: token.pos };
                        }

                        return {
                            type: 'string',
                            value: token.value
                        };
                    }
                }, {
                    key: 'errorMark',
                    value: function errorMark(text) {
                        var currentToken = this.tokens[this.index];
                        var type = currentToken ? currentToken.type : 'end of string';
                        throw {
                            message: text + " instead found " + type,
                            pos: currentToken ? currentToken.pos : this.lexer.char
                        };
                    }
                }, {
                    key: 'consumeToken',
                    value: function consumeToken() {
                        this.index++;
                        return this.tokens[this.index - 1];
                    }
                }, {
                    key: 'matchToken',
                    value: function matchToken(type, index) {
                        var token = this.tokens[this.index + index];
                        return token === undefined && type === '' || token && token.type === type;
                    }
                }, {
                    key: 'match',
                    value: function match(token1, token2) {
                        return this.matchToken(token1, 0) && (!token2 || this.matchToken(token2, 1));
                    }
                }]);

                return Parser;
            }());

            _export('Parser', Parser);
        }
    };
});
//# sourceMappingURL=parser.js.map
