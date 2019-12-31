import { Container } from './container';
import { trackList, trackItem } from './config';
export default class Composition {
  container: Container
  constructor(container: Container) {
    this.container = container;
  }
  parseColumns() {
    const config = this.container.config;
    if (config.gridTemplateColumns) {

    }
  }
  compose() {
    this.parseColumns();
  }
}