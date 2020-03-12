import { trackList, ceil, trackItem, trackType } from '../config';
import { Container } from '../container';

export class TrackSizeCompute {
  trackList: trackList;
  ceils: ceil[][];
  container: Container;
  type: trackType;
  containerSize: number;
  freeSpace: number;
  constructor(trackList: trackList, ceils: ceil[][], container: Container, type: trackType) {
    this.trackList = trackList;
    this.ceils = ceils;
    this.container = container;
    this.type = type;
    const config = this.container.config;
    const gap = <number>(this.type === 'row' ? config.gridRowGap : config.gridColumnGap);
    this.containerSize = this.type === 'row' ? config.height : config.width;
    this.freeSpace = this.containerSize - gap * (trackList.length - 1);
  }
  private parseMinContent(index: number): number {
    const items = (this.ceils[index] || []).filter(item => item).filter(item => item.node.length === 1);
    const size = items.map(item => {
      const config = item.node[0].config;
      return this.type === 'row' ? config.minContentHeight : config.minContentWidth;
    });
    return Math.max(...size);
  }
  private parseMaxContent(index: number): number {
    const items = (this.ceils[index] || []).filter(item => item).filter(item => item.node.length === 1);
    const size = items.map(item => {
      const config = item.node[0].config;
      return this.type === 'row' ? config.maxContentHeight : config.maxContentWidth;
    });
    return Math.max(...size);
  }
  private parseFitContent(track: trackItem, index: number) {
    const arg = <trackItem>track.args[0];
    if (arg.type === '%') {
      const config = this.container.config;
      arg.value *= (this.type === 'row' ? config.height : config.width) / 100;
    }
    const min = this.parseMinContent(index);
    const max = this.parseMaxContent(index);
    return Math.min(max, Math.max(min, arg.value));
  }
  private parseMinMax(track: trackItem, index: number) {
    const min = <trackItem>track.args[0];
    const max = <trackItem>track.args[1];
    const minValue = this.parseTrackItem(min, index);
    if (minValue > -1) {
      min.value = minValue;
      min.type = '';
    } else {
      if (min.type === 'auto') {
        min.value = this.parseMinContent(index);
        min.type = '';
      }
    }
    const maxValue = this.parseTrackItem(max, index);
    if (maxValue > -1) {
      max.value = maxValue;
      max.type = '';
    }
  }
  private parseTrackItem(track: trackItem, index: number): number {
    switch (track.type) {
      case 'min-content':
        return this.parseMinContent(index);
      case 'max-content':
        return this.parseMaxContent(index);
      case 'fit-content':
        return this.parseFitContent(track, index);
      case '%':
        return track.value * this.containerSize / 100;
      case '':
        return track.value;
    }
    return -1;
  }
  private parseFr(freeSpace: number, frCount: number) {
    while (true) {
      const itemSpace = freeSpace / frCount;
      let flag = false;
      this.trackList.forEach((track: trackItem, index: number) => {
        if (track.type === 'fr') {
          const space = track.value * itemSpace;
          const minSpace = this.parseMinContent(index);
          if (space < minSpace) {
            freeSpace -= minSpace;
            track.baseSize = minSpace;
            track.type = '';
            frCount -= track.value;
            flag = true;
          }
        } else if (track.type === 'minmax') {
          const min = <trackItem>track.args[0];
          const max = <trackItem>track.args[1];
          if (max.type === 'fr') {

          }
        }
      })
      if (!flag) {
        break;
      }
    }
  }
  public parse() {
    let freeSpace = this.freeSpace;
    let frCount = 0;
    this.trackList.forEach((track: trackItem, index: number) => {
      const value = this.parseTrackItem(track, index);
      if (value > -1) {
        track.value = value;
        track.type = '';
        track.baseSize = value;
        freeSpace -= value;
        return;
      }
      if (track.type === 'fr') {
        frCount += track.value;
      } else if (track.type === 'minmax') {
        this.parseMinMax(track, index);
        freeSpace -= (<trackItem>track.args[0]).value;
        const max = <trackItem>track.args[1];
        if (max.type === 'fr') {
          frCount += track.value;
        }
      }
    })
  }
}