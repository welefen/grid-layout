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
var GridLineBase = /** @class */ (function () {
    function GridLineBase() {
    }
    return GridLineBase;
}());
// 'auto'
var GridLineAuto = /** @class */ (function (_super) {
    __extends(GridLineAuto, _super);
    function GridLineAuto() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return GridLineAuto;
}(GridLineBase));
exports.GridLineAuto = GridLineAuto;
// 100px 100
var GridLineLength = /** @class */ (function (_super) {
    __extends(GridLineLength, _super);
    function GridLineLength(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    return GridLineLength;
}(GridLineBase));
exports.GridLineLength = GridLineLength;
// 10%
var GridLinePercentage = /** @class */ (function (_super) {
    __extends(GridLinePercentage, _super);
    function GridLinePercentage(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    return GridLinePercentage;
}(GridLineBase));
exports.GridLinePercentage = GridLinePercentage;
// min-content
var GridLineMinContent = /** @class */ (function (_super) {
    __extends(GridLineMinContent, _super);
    function GridLineMinContent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return GridLineMinContent;
}(GridLineBase));
exports.GridLineMinContent = GridLineMinContent;
// max-content
var GridLineMaxContent = /** @class */ (function (_super) {
    __extends(GridLineMaxContent, _super);
    function GridLineMaxContent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return GridLineMaxContent;
}(GridLineBase));
exports.GridLineMaxContent = GridLineMaxContent;
// 1fr
var GridLineFlex = /** @class */ (function (_super) {
    __extends(GridLineFlex, _super);
    function GridLineFlex(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    return GridLineFlex;
}(GridLineBase));
exports.GridLineFlex = GridLineFlex;
var GridLineMinMax = /** @class */ (function (_super) {
    __extends(GridLineMinMax, _super);
    function GridLineMinMax(min, max) {
        var _this = _super.call(this) || this;
        _this.min = min;
        _this.max = max;
        return _this;
    }
    return GridLineMinMax;
}(GridLineBase));
exports.GridLineMinMax = GridLineMinMax;
var GridLineFitContent = /** @class */ (function (_super) {
    __extends(GridLineFitContent, _super);
    function GridLineFitContent(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    return GridLineFitContent;
}(GridLineBase));
exports.GridLineFitContent = GridLineFitContent;
var GridLineRepeatValue = /** @class */ (function (_super) {
    __extends(GridLineRepeatValue, _super);
    function GridLineRepeatValue(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    return GridLineRepeatValue;
}(GridLineBase));
exports.GridLineRepeatValue = GridLineRepeatValue;
var GridLineRepeat = /** @class */ (function (_super) {
    __extends(GridLineRepeat, _super);
    function GridLineRepeat(num, value) {
        var _this = _super.call(this) || this;
        _this.num = num;
        _this.value = value;
        return _this;
    }
    return GridLineRepeat;
}(GridLineBase));
exports.GridLineRepeat = GridLineRepeat;
