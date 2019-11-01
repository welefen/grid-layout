"use strict";
exports.__esModule = true;
var gridLines_1 = require("./gridLines");
var whitespace = ' \u00a0\n\r\t\f\u000b\u200b\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000';
var splitChars = '()[],/';
var Tokenizer = /** @class */ (function () {
    function Tokenizer(text) {
        this.text = text;
    }
    Tokenizer.prototype.isWhitespace = function (char) {
        return whitespace.indexOf(char) > -1;
    };
    Tokenizer.prototype.getTokens = function () {
        var tokens = [];
        var length = this.text.length;
        var token = '';
        var index = 0;
        while (index < length) {
            var char = this.text[index];
            var isWhitespace = this.isWhitespace(char);
            if (isWhitespace || splitChars.indexOf(char) > -1) {
                if (token) {
                    tokens.push(token);
                    token = '';
                }
                index++;
                if (!isWhitespace) {
                    tokens.push(char);
                }
                continue;
            }
            token += char;
            index++;
        }
        if (token) {
            tokens.push(token);
        }
        return tokens;
    };
    return Tokenizer;
}());
exports.Tokenizer = Tokenizer;
function isType(val, types) {
    return types.some(function (item) { return val instanceof item; });
}
function isFixedBreadth(val) {
    return isType(val, [gridLines_1.GridLineLength, gridLines_1.GridLinePercentage]);
}
function isInflexibleBreadth(val) {
    return isFixedBreadth(val) || isType(val, [gridLines_1.GridLineMinContent, gridLines_1.GridLineMaxContent, gridLines_1.GridLineAuto]);
}
function isTrackBreadth(val) {
    return isInflexibleBreadth(val) || isType(val, [gridLines_1.GridLineFlex]);
}
function parseRepeatNum(val) {
    if (val === 'auto-fill' || val === 'auto-fit')
        return val;
    if (/^\d+$/.test(val))
        return parseInt(val, 10);
    throw new Error(val + " is not allowed");
}
var GridLineParser = /** @class */ (function () {
    function GridLineParser(text) {
        this.tokens = new Tokenizer(text).getTokens();
        this.index = 0;
        this.length = this.tokens.length;
    }
    GridLineParser.prototype.nextNeed = function (token) {
        if (this.peek() !== token) {
            throw new Error("next token must be " + token);
        }
    };
    GridLineParser.prototype.peek = function () {
        return this.tokens[this.index++];
    };
    GridLineParser.prototype.parseValue = function (value) {
        if (value === 'auto') {
            return new gridLines_1.GridLineAuto();
        }
        if (value === 'min-content') {
            return new gridLines_1.GridLineMinContent();
        }
        if (value === 'max-content') {
            return new gridLines_1.GridLineMaxContent();
        }
        var lenReg = /^(\d+(?:\.\d+)?)+(px|fr|%)?$/;
        var match = value.match(lenReg);
        if (match) {
            var val = parseFloat(match[1]);
            if (!match[2] || match[2] === 'px') {
                return new gridLines_1.GridLineLength(val);
            }
            if (match[2] === '%') {
                return new gridLines_1.GridLinePercentage(val);
            }
            if (match[2] === 'fr') {
                return new gridLines_1.GridLineFlex(val);
            }
        }
        throw new Error(value + " is not allowed");
    };
    // fit-content(<lenth-percentage>)
    GridLineParser.prototype.parseFitContent = function () {
        this.nextNeed('(');
        var value = this.peek();
        this.nextNeed(')');
        var val = this.parseValue(value);
        if (!isFixedBreadth(val)) {
            throw new Error(value + " must be length or percentage");
        }
        return new gridLines_1.GridLineFitContent(val);
    };
    // minmax()
    GridLineParser.prototype.parseMinMax = function () {
        this.nextNeed('(');
        var minValue = this.peek();
        var min = this.parseValue(minValue);
        this.nextNeed(',');
        var maxValue = this.peek();
        var max = this.parseValue(maxValue);
        this.nextNeed(')');
        if ((isInflexibleBreadth(min) && isTrackBreadth(max)) ||
            (isFixedBreadth(min) && isTrackBreadth(max)) ||
            (isInflexibleBreadth(min) && isFixedBreadth(max))) {
            return new gridLines_1.GridLineMinMax(min, max);
        }
        throw new Error("error parameters " + minValue + " and " + maxValue);
    };
    // [linename1 linename2]
    GridLineParser.prototype.parseLineNames = function () {
        var lineNames = [];
        var isEnd = false;
        while (this.index < this.length) {
            var item = this.peek();
            if (item === ']') {
                isEnd = true;
                break;
            }
            else {
                lineNames.push(item);
            }
        }
        if (!isEnd) {
            throw new Error("parse line names error");
        }
        return lineNames;
    };
    GridLineParser.prototype.parseRepeat = function () {
        this.nextNeed('(');
        var repeatNum = parseRepeatNum(this.peek());
        this.nextNeed(',');
        var result = this.parseCondition(function (str) {
            return str !== ')';
        }, ['minmax', 'fit-content']);
        var value = new gridLines_1.GridLineRepeatValue(result.lines);
        value.lineNames = result.lineNames;
        var instance = new gridLines_1.GridLineRepeat(repeatNum, value);
        return instance;
    };
    GridLineParser.prototype.parseCondition = function (checkFn, supports) {
        var lines = [];
        var lineNames = [];
        while (this.index < this.length) {
            var item = this.peek();
            if (!checkFn(item))
                break;
            var value = void 0;
            if (item === '[') {
                lineNames = this.parseLineNames();
                continue;
            }
            if (item === 'minmax' && supports.indexOf('minmax') > -1) {
                value = this.parseMinMax();
            }
            else if (item === 'fit-content' || supports.indexOf('fit-content') > -1) {
                value = this.parseFitContent();
            }
            else if (item === 'repeat' || supports.indexOf('repeat') > -1) {
                value = this.parseRepeat();
            }
            else {
                value = this.parseValue(item);
            }
            value.lineNames = lineNames;
            lineNames = [];
            lines.push(value);
        }
        return { lines: lines, lineNames: lineNames };
    };
    GridLineParser.prototype.parse = function () {
        var lines = this.parseCondition(function (_) { return true; }, ['minmax', 'fit-content', 'repeat']).lines;
    };
    return GridLineParser;
}());
exports.GridLineParser = GridLineParser;
