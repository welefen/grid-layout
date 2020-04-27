import Sync from './sync.js';

const sync = new Sync({warn: true});

export const getRender = (container, items, inLocal) => {
  if(inLocal) {
    return sync.POST('/index/render', {
      container: JSON.stringify(container),
      items: JSON.stringify(items)
    });
  }
  const containerNode = new GridLayout.Container(container);
  items.forEach((item) => {
    const node = new GridLayout.Node(item);
    containerNode.appendChild(node);
  });
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
  return layout
};

export const addTestCase = (container, items) => {
  return sync.POST('/index/collect', {
    container: JSON.stringify(container),
    items: JSON.stringify(items)
  });
};

export const getAllTest = () => {
  return sync.POST('/index/test');
};
