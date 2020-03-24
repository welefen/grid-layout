import { trackList, ceil, trackItem, trackType } from '../config';
import { Container } from '../container';
import { isAutoMinMaxTrack, isAutoTrack, isMinMaxTrack, isFrTrack, parseSpaceBetween } from '../util/track';

export class TrackSizeCompute {
  trackList: trackList;
  ceils: ceil[][];
  container: Container;
  type: trackType;
  containerSize: number;
  freeSpace: number;
  gap: number;
  constructor(trackList: trackList, ceils: ceil[][], container: Container, type: trackType) {
    this.trackList = trackList;
    this.ceils = ceils;
    this.container = container;
    this.type = type;
    const config = this.container.config;
    const gap = <number>(this.type === 'row' ? config.gridRowGap : config.gridColumnGap);
    this.gap = gap;
    this.containerSize = this.type === 'row' ? config.height : config.width;
    this.freeSpace = this.containerSize - gap * (trackList.length - 1);
  }
  private parseTrackItemValue(track: trackItem, index: number): number {
    switch (track.type) {
      case 'min-content':
        return this.parseMinContent(index);
      case 'max-content':
        return this.parseMaxContent(index);
      case 'fit-content':
        return this.parseFitContent(track, index);
      case '%':
        return track.value * this.containerSize / 100;
      case 'auto':
        return this.parseMinContent(index);
      case '':
        return track.value;
    }
    return -1;
  }
  private parseTrackSize() {
    this.trackList.forEach((track: trackItem, index: number) => {
      if (isMinMaxTrack(track)) {
        const min = <trackItem>track.args[0];
        const max = <trackItem>track.args[1];
        const minValue = this.parseTrackItemValue(min, index);
        const maxValue = this.parseTrackItemValue(max, index);
        track.baseSize = minValue;
        if (maxValue > -1) {
          track.growthLimit = maxValue;
        }
        if (track.growthLimit < track.baseSize) {
          track.growthLimit = track.baseSize;
        }
      } else {
        const value = this.parseTrackItemValue(track, index);
        if (value > -1) {
          track.baseSize = value;
        }
      }
    })
  }
  private getCeilItems(index: number): ceil[] {
    const items = this.type === 'row' ? this.ceils[index] : this.ceils.map(item => item[index]);
    return (items || []).filter(item => {
      return item && item.node.length === 1;
    })
  }
  private parseMinContent(index: number): number {
    const items = this.getCeilItems(index);
    const size = items.map(item => {
      const node = item.node[0];
      return this.type === 'row' ? node.minContentHeight : node.minContentWidth;
    });
    return Math.max(...size);
  }
  private parseMaxContent(index: number): number {
    const items = this.getCeilItems(index);
    const size = items.map(item => {
      const node = item.node[0];
      return this.type === 'row' ? node.maxContentHeight : node.maxContentWidth;
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
  private parseFrTrack() {
    let frCount = 0;
    let freeSpace = this.freeSpace;
    this.trackList.forEach((track: trackItem) => {
      if (isFrTrack(track)) {
        frCount += track.value;
      } else if (isMinMaxTrack(track)) {
        const max = <trackItem>track.args[1];
        if (isFrTrack(max)) {
          frCount += max.value;
        } else {
          freeSpace -= track.growthLimit;
        }
      } else {
        freeSpace -= track.baseSize;
      }
    })
    if (!frCount) return;
    while (true) {
      const itemSpace = Math.max(0, freeSpace) / frCount;
      let flag = false;
      this.trackList.forEach((track: trackItem, index: number) => {
        if (isFrTrack(track)) {
          const space = track.value * itemSpace;
          const minSpace = this.parseMinContent(index);
          if (space < minSpace) {
            freeSpace -= minSpace;
            track.baseSize = minSpace;
            track.growthLimit = track.baseSize;
            track.type = '';
            flag = true;
          }
        }
      })
      if (!flag) {
        this.trackList.forEach((track: trackItem, index: number) => {
          if (isFrTrack(track)) {
            track.baseSize = track.value * itemSpace;
            track.type = '';
          } else if (isMinMaxTrack(track)) {
            const max = <trackItem>track.args[1];
            if (isFrTrack(max)) {
              const space = max.value * itemSpace;
              max.value = space;
              max.type = '';
              track.growthLimit = space;
              if (track.growthLimit < track.baseSize) {
                track.growthLimit = track.baseSize;
              }
            }
          }
        })
        break;
      }
    }
  }
  private parseMinMaxTrack() {
    let freeSpace = this.freeSpace;
    let minmaxCount = 0;
    this.trackList.forEach((track: trackItem) => {
      freeSpace -= track.baseSize;
      if (isMinMaxTrack(track)) {
        const max = <trackItem>track.args[1];
        if (!isAutoTrack(max)) {
          minmaxCount++;
        }
      }
    })
    if (!minmaxCount || freeSpace < 0) return;
    while (true) {
      const itemSpace = freeSpace / minmaxCount;
      let flag = false;
      this.trackList.forEach((track: trackItem) => {
        if (isMinMaxTrack(track)) {
          const max = <trackItem>track.args[1];
          if (!isAutoTrack(max) && track.growthLimit < track.baseSize + itemSpace) {
            track.baseSize = track.growthLimit;
            freeSpace -= track.growthLimit - track.baseSize;
            minmaxCount--;
            flag = true;
          }

        }
      })
      if (!flag) {
        this.trackList.forEach((track: trackItem) => {
          if (isMinMaxTrack(track)) {
            const max = <trackItem>track.args[1];
            if (!isAutoTrack(max) && track.growthLimit > track.baseSize) {
              track.baseSize += itemSpace;
            }
          }
        })
        break;
      }
    }
  }
  private parseAutoTrack() {
    const config = this.container.config;
    if (this.type === 'column' && config.justifyContent !== 'stretch') return;
    if (this.type === 'row' && config.alignContent !== 'stretch') return;
    let freeSpace = this.freeSpace;
    let autoCount = 0;
    this.trackList.forEach((track: trackItem) => {
      freeSpace -= track.baseSize;
      if (isAutoTrack(track)) {
        autoCount++;
      } else if (isAutoMinMaxTrack(track)) {
        autoCount++;
      }
    })
    if (!autoCount || freeSpace < 0) return;
    const itemSpace = freeSpace / autoCount;
    this.trackList.forEach(track => {
      if (isAutoTrack(track)) {
        track.baseSize += itemSpace;
      } else if (isAutoMinMaxTrack(track)) {
        track.baseSize += itemSpace;
      }
    })
  }
  private parseTrackPosition() {
    let freeSpace = this.freeSpace;
    this.trackList.forEach(track => {
      freeSpace -= track.baseSize;
    })
    const config = this.container.config;
    const type = this.type === 'row' ? config.alignContent : config.justifyContent;
    const marginSize = parseSpaceBetween(freeSpace, type, this.trackList.length);
    let pos = 0;
    this.trackList.forEach((track, index) => {
      track.pos = pos + marginSize[index];
      pos = track.pos + track.baseSize + this.gap;
    })
  }
  public parse() {
    this.parseTrackSize();
    this.parseFrTrack();
    this.parseMinMaxTrack();
    this.parseAutoTrack();
    this.parseTrackPosition();
  }
}