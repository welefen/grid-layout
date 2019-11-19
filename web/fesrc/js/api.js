import Sync from './sync.js';

const sync = new Sync({warn: true});

export const getRender = (container, items) => {
  return sync.POST('/index/render', {
    container: JSON.stringify(container),
    items: JSON.stringify(items)
  });
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
