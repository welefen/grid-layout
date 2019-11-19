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
var whitespace = ' \u00a0\n\r\t\f\u000b\u200b\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000';
var trackListSplitChars = '()[],/';
var Tokenizer = /** @class */ (function () {
    function Tokenizer(text) {
        this.text = text;
    }
    Tokenizer.prototype.isWhitespace = function (char) {
        return whitespace.indexOf(char) > -1;
    };
    return Tokenizer;
}());
var TrackListTokenizer = /** @class */ (function (_super) {
    __extends(TrackListTokenizer, _super);
    function TrackListTokenizer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TrackListTokenizer.prototype.getTokens = function () {
        var tokens = [];
        var length = this.text.length;
        var token = '';
        var index = 0;
        while (index < length) {
            var char = this.text[index];
            var isWhitespace = this.isWhitespace(char);
            if (isWhitespace || trackListSplitChars.indexOf(char) > -1) {
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
    return TrackListTokenizer;
}(Tokenizer));
exports.TrackListTokenizer = TrackListTokenizer;
