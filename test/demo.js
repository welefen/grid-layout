const { Container, Node } = require("../lib/index");
const container = new Container({
  width: 500,
  height: 500,
  gridTemplateAreas: [['a', 'c', 'b']]
});
[
  { width: 100, height: 100 },
  { width: 100, height: 100 }
].forEach(item => {
  const node = new Node(item);
  container.appendChild(node);
});

container.calculateLayout();
const result = container.getAllComputedLayout();
console.log(result);
