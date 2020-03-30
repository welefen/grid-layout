import { TrackList, GridCell, TrackItem, TrackType } from '../util/config';
import { Container } from '../container';
import { Node } from '../node';
import { isAutoMinMaxTrack, isAutoTrack, isMinMaxTrack, isFrTrack, isFixedBreadth, isFrMinMaxTrack } from '../util/track';
import { parseAlignSpace } from '../util/util';

export class TrackCompute {
  trackList: TrackList;
  cells: GridCell[][];
  container: Container;
  type: TrackType;
  containerSize: number;
  freeSpace: number;
  gap: number;
  constructor(trackList: TrackList, cells: GridCell[][], container: Container, type: TrackType) {
    this.trackList = trackList;
    this.cells = cells;
    this.container = container;
    this.type = type;
    const config = this.container.config;
    const gap = <number>(this.type === 'row' ? config.gridRowGap : config.gridColumnGap);
    this.gap = gap;
    this.containerSize = this.type === 'row' ? config.height : config.width;
  }
  private parseTrackItemValue(track: TrackItem, index: number): number {
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
      case 'px':
        return track.value;
    }
    return -1;
  }
  private removeEmptyAutoFitTrack() {
    const tracks: TrackList = [];
    this.trackList.forEach((track, index) => {
      if (track.autoFit) {
        const nodes = this.getTrackNodes(index);
        if (nodes.length === 0) return;
      }
      tracks.push(track);
    })
    this.trackList = tracks;
  }
  private parseTrackSize() {
    this.trackList.forEach((track, index) => {
      if (isMinMaxTrack(track)) {
        const min = <TrackItem>track.args[0];
        const max = <TrackItem>track.args[1];
        const minValue = this.parseTrackItemValue(min, index);
        const minContentValue = this.parseMinContent(index);
        const maxValue = this.parseTrackItemValue(max, index);
        if (maxValue > -1) {
          track.growthLimit = maxValue;
          track.baseSize = Math.max(minValue, Math.min(minContentValue, maxValue));
        } else {
          track.baseSize = Math.max(minValue, minContentValue);
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
  private getTrackNodes(index: number): Node[] {
    const items = this.type === 'row' ? this.cells[index] : this.cells.map(item => item[index]);
    const result: Node[] = [];
    (items || []).forEach(item => {
      if (item && item.node) {
        result.push(...item.node);
      }
    })
    return result;
  }
  private getNodeInCellSize(node: Node, size: number, index: number) {
    const cells = node.cells;
    if (cells.length === 1) return size;
    let min = 0;
    let max = 0;
    cells.forEach((cell, index) => {
      const idx = this.type === 'row' ? cell.row : cell.column;
      if (index === 0) {
        min = idx;
        max = idx;
      } else {
        min = Math.min(min, idx);
        max = Math.max(max, idx);
      }
    })
    if (min === max) return size;
    let num = 0;
    for (let i = min; i <= max; i++) {
      const track = this.trackList[i];
      if (isFixedBreadth(track)) {
        size -= track.baseSize;
      } else {
        num++;
      }
    }
    const itemValue = Math.round(Math.max(0, size) / num);
    if (index === max) {
      return size - itemValue * (num - 1);
    }
    return itemValue;
  }
  private parseMinContent(index: number): number {
    const nodes = this.getTrackNodes(index);
    const size = nodes.map(node => {
      const value = this.type === 'row' ? node.minContentHeight : node.minContentWidth;
      return this.getNodeInCellSize(node, value, index);
    });
    if (size.length === 0) return 0;
    return Math.max(...size);
  }
  private parseMaxContent(index: number): number {
    const nodes = this.getTrackNodes(index);
    const size = nodes.map(node => {
      const value = this.type === 'row' ? node.maxContentHeight : node.maxContentWidth;
      return this.getNodeInCellSize(node, value, index);
    });
    if (size.length === 0) return 0;
    return Math.max(...size);
  }
  private parseFitContent(track: TrackItem, index: number) {
    const arg = <TrackItem>track.args[0];
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
    this.trackList.forEach(track => {
      if (isFrTrack(track)) {
        frCount += track.value;
      } else if (isMinMaxTrack(track)) {
        const max = <TrackItem>track.args[1];
        if (isFrTrack(max)) {
          frCount += max.value;
        } else if (isAutoTrack(max)) {
          freeSpace -= track.baseSize;
        } else {
          freeSpace -= track.growthLimit;
        }
      } else {
        freeSpace -= track.baseSize;
      }
    })
    if (!frCount) return;
    frCount = Math.max(1, frCount);
    while (true) {
      const itemSpace = Math.max(0, freeSpace) / frCount;
      let flag = false;
      this.trackList.forEach((track, index) => {
        if (isFrTrack(track)) {
          const space = track.value * itemSpace;
          const minSpace = this.parseMinContent(index);
          if (space < minSpace) {
            frCount -= track.value;
            freeSpace -= minSpace;
            track.baseSize = minSpace;
            track.growthLimit = track.baseSize;
            track.type = 'px';
            flag = true;
          }
        } else if (isFrMinMaxTrack(track)) {
          const max = <TrackItem>track.args[1];
          const space = max.value * itemSpace;
          if (space < track.baseSize) {
            frCount -= max.value;
            freeSpace -= track.baseSize;
            track.growthLimit = track.baseSize;
            max.value = track.baseSize;
            max.type = 'px';
            flag = true;
          }
        }
      })
      if (!flag) {
        this.trackList.forEach((track, index) => {
          if (isFrTrack(track)) {
            track.baseSize = track.value * itemSpace;
            track.type = 'px';
          } else if (isFrMinMaxTrack(track)) {
            const max = <TrackItem>track.args[1];
            const space = max.value * itemSpace;
            max.value = space;
            max.type = 'px';
            track.growthLimit = space;
            if (track.growthLimit < track.baseSize) {
              track.growthLimit = track.baseSize;
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
    this.trackList.forEach(track => {
      freeSpace -= track.baseSize;
      if (isMinMaxTrack(track)) {
        const max = <TrackItem>track.args[1];
        if (!isAutoTrack(max)) {
          minmaxCount++;
        }
      }
    })
    if (!minmaxCount || freeSpace < 0) return;
    while (true) {
      const itemSpace = freeSpace / minmaxCount;
      let flag = false;
      this.trackList.forEach(track => {
        if (isMinMaxTrack(track)) {
          const max = <TrackItem>track.args[1];
          if (!isAutoTrack(max) && track.growthLimit < track.baseSize + itemSpace) {
            track.baseSize = track.growthLimit;
            freeSpace -= track.growthLimit - track.baseSize;
            minmaxCount--;
            flag = true;
          }
        }
      })
      if (!flag) {
        this.trackList.forEach(track => {
          if (isMinMaxTrack(track)) {
            const max = <TrackItem>track.args[1];
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
    this.trackList.forEach(track => {
      freeSpace -= track.baseSize;
      if (isAutoTrack(track) || isAutoMinMaxTrack(track)) {
        autoCount++;
      }
    })
    if (!autoCount || freeSpace < 0) return;
    let itemSpace = Math.round(freeSpace / autoCount);
    let count = 0;
    this.trackList.forEach(track => {
      if (isAutoTrack(track) || isAutoMinMaxTrack(track)) {
        // fix last item space
        if (count === autoCount - 1) {
          itemSpace = freeSpace - itemSpace * count;
        }
        track.baseSize += itemSpace;
        count++;
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
    const marginSize = parseAlignSpace(freeSpace, type, this.trackList.length);
    let pos = 0;
    this.trackList.forEach((track, index) => {
      track.pos = pos + marginSize[index];
      pos = track.pos + track.baseSize + this.gap;
    })
  }
  public parse() {
    this.removeEmptyAutoFitTrack();
    this.freeSpace = this.containerSize - this.gap * (this.trackList.length - 1);
    this.parseTrackSize();
    this.parseFrTrack();
    this.parseMinMaxTrack();
    this.parseAutoTrack();
    this.parseTrackPosition();
  }
}