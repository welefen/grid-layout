import test from "ava";
import { getdirFiles } from "think-helper";
import path from "path";
import { Container, Node } from "../lib/index";
import fs from 'fs';

const files = getdirFiles(path.join(__dirname, 'case'));

files.forEach(file => {
  test(file, t => {
    const filepath = path.join(__dirname, 'case', file);
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    const container = new Container(data.container);
    data.items.forEach(item => {
      const node = new Node(item);
      container.appendChild(node);
    })
    container.calculateLayout();
    const result = container.getAllComputedLayout();
    t.deepEqual(result, data.result);
  });
});
