import Container from './container';
export default class Composition {
  container: Container
  constructor(container: Container) {
    this.container = container;
  }
  parseColumns() {
    const config = this.container.config;
    if(config.gridTemplateColumns) {
      
    }
  }
  compose() {
    this.parseColumns();
  }
}