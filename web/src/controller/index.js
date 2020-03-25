const path = require('path');
const fs = require('fs');
const assert = require('assert');
const Base = require('./base.js');
const {Node, Container} = require('../../../lib/index.js');
const casePath = path.join(think.ROOT_PATH, '../test/case/');

module.exports = class extends Base {
  indexAction() {
    return this.display();
  }

  testAction() {
    const files = think.getdirFiles(casePath);
    let success = 0;
    const fail = [];
    files.forEach((file) => {
      const data = JSON.parse(fs.readFileSync(path.join(casePath, file), 'utf8'));
      const container = new Container(data.container);
      data.items.forEach((item) => {
        const node = new Node(item);
        container.appendChild(node);
      });
      container.calculateLayout();
      const result = container.getAllComputedLayout();
      try {
        assert.deepEqual(result, data.result);
        success++;
      } catch (e) {
        data.name = file;
        fail.push(data);
      }
    });
    return this.success({success, fail});
  }

  renderAction() {
    const container = JSON.parse(this.post('container'));
    const items = JSON.parse(this.post('items'));
    const containerNode = new Container(container);
    items.forEach((item) => {
      const node = new Node(item);
      containerNode.appendChild(node);
    });
    try {
      containerNode.calculateLayout();
      const props = [
        'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
        'borderTop', 'borderRight', 'borderBottom', 'borderLeft', 'boxSizing'
      ];
      const layout = containerNode.getAllComputedLayout(props);
      containerNode.children.forEach((node, index) => {
        props.forEach(prop => {
          layout.children[index][prop] = node.config[prop];
        })
      })
      return this.success(layout);
    } catch (e) {
      console.log(e)
      return this.fail(1000, e.message);
    }
  }

  collectAction() {
    const container = JSON.parse(this.post('container'));
    const items = JSON.parse(this.post('items'));
    const containerNode = new Container(container);
    items.forEach((item) => {
      const node = new Node(item);
      containerNode.appendChild(node);
    });
    containerNode.calculateLayout();
    const layout = containerNode.getAllComputedLayout();
    const data = {
      container,
      items,
      result: layout
    };
    const key = think.md5(JSON.stringify({
      container: data.container,
      items: data.items
    }));
    fs.writeFileSync(path.join(casePath, `${key}.json`), JSON.stringify(data, undefined, 2));
    return this.success();
  }
};
