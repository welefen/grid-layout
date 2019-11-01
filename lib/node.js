"use strict";
exports.__esModule = true;
var id = 1;
var Node = /** @class */ (function () {
    function Node(config) {
        this.id = 0;
        this.id = ++id;
        this.parent = null;
        this.children = [];
        this.config = config;
    }
    Node.prototype.appendChild = function (node) {
        node.parent = this;
        this.children.push(node);
        return this;
    };
    return Node;
}());
exports["default"] = Node;
