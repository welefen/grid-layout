"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var tokenizer_1 = require("./tokenizer");
var Parser = /** @class */ (function () {
    function Parser(text) {
        this.index = 0;
        this.text = text;
    }
    Parser.prototype.nextNeed = function (token) {
        if (this.peek() !== token) {
            throw new Error("next token must be " + token);
        }
    };
    Parser.prototype.peek = function () {
        return this.tokens[this.index++];
    };
    return Parser;
}());
var TrackListParser = /** @class */ (function (_super) {
    __extends(TrackListParser, _super);
    function TrackListParser() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TrackListParser.prototype.parse = function () {
        var instance = new tokenizer_1.TrackListTokenizer(this.text);
        this.tokens = instance.getTokens();
        this.length = this.tokens.length;
        return this.parseCondition(function (_) { return true; }, ['minmax', 'fit-content', 'repeat']);
    };
    TrackListParser.prototype.parseValue = function (value) {
        if (value === 'auto' || value === 'min-content' || value === 'max-content') {
            return { value: value };
        }
        var lenReg = /^(\d+(?:\.\d+)?)+(px|fr|%)?$/;
        var match = value.match(lenReg);
        if (match) {
            var val = parseFloat(match[1]);
            if (!match[2] || match[2] === 'px') {
                return { value: val, unit: '' };
            }
            if (match[2] === '%') {
                return { value: val, unit: '%' };
            }
            if (match[2] === 'fr') {
                return { value: val, unit: 'fr' };
            }
        }
        throw new Error(value + " is not allowed");
    };
    // fit-content(<lenth-percentage>)
    TrackListParser.prototype.parseFitContent = function () {
        this.nextNeed('(');
        var value = this.peek();
        this.nextNeed(')');
        var val = this.parseValue(value);
        return { type: 'fit-content', args: [val] };
    };
    // minmax(min, max)
    TrackListParser.prototype.parseMinMax = function () {
        this.nextNeed('(');
        var minValue = this.peek();
        var min = this.parseValue(minValue);
        this.nextNeed(',');
        var maxValue = this.peek();
        var max = this.parseValue(maxValue);
        this.nextNeed(')');
        return { type: 'minmax', args: [min, max] };
    };
    // [linename1 linename2]
    TrackListParser.prototype.parseLineNames = function () {
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
    TrackListParser.prototype.parseRepeatNum = function (val) {
        if (val === 'auto-fill' || val === 'auto-fit')
            return val;
        if (/^\d+$/.test(val))
            return parseInt(val, 10);
        throw new Error(val + " is not allowed");
    };
    TrackListParser.prototype.parseRepeat = function () {
        this.nextNeed('(');
        var repeatNum = this.parseRepeatNum(this.peek());
        this.nextNeed(',');
        var isEnd = false;
        var result = this.parseCondition(function (str) {
            var flag = (str !== ')');
            if (!flag) {
                isEnd = true;
            }
            return flag;
        }, ['minmax', 'fit-content']);
        if (!isEnd) {
            throw new Error('can not find ) in repeat syntax');
        }
        return {
            type: 'repeat',
            args: [repeatNum, result]
        };
    };
    TrackListParser.prototype.parseCondition = function (checkFn, supports) {
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
            else if (item === 'fit-content' && supports.indexOf('fit-content') > -1) {
                value = this.parseFitContent();
            }
            else if (item === 'repeat' && supports.indexOf('repeat') > -1) {
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
    return TrackListParser;
}(Parser));
exports.TrackListParser = TrackListParser;
