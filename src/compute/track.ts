import deepmerge from 'deepmerge';
import { Container } from '../container';
import { trackList, trackItem, trackType } from '../config';
import { isFixedBreadth, isAutoRepeat, isFixedRepeat } from '../util/track';

export class TrackCompute {
  trackList: trackList;
  container: Container;
  type: trackType;
  constructor(trackList: trackList, container: Container, type: trackType) {
    this.trackList = trackList;
    this.container = container;
    this.type = type;
    this.parseTrackList();
  }
  /**
   * expand repeat to trackList
   * @param track 
   */
  private expandRepeat(track: trackItem, num?: number): trackList {
    const repeatNum = num || track.args[0] as number;
    const repeatValue = track.args[1] as trackList;
    const result: trackItem[] = [];
    let i = 0;
    while (i++ < repeatNum) {
      const copy = deepmerge([], repeatValue.tracks);
      if (result.length && repeatValue.lineNames.length) {
        copy[0].lineNames.push(...repeatValue.lineNames);
      }
      result.push(...copy);
    }
    if (track.lineNames.length) {
      result[0].lineNames.push(...track.lineNames);
    }
    return {
      tracks: result,
      lineNames: repeatValue.lineNames
    };
  }
  get size() {
    return this.type === 'row' ? this.container.config.height : this.container.config.width;
  }
  get gap(): number {
    return <number>(this.type === 'row' ? this.container.config.gridRowGap : this.container.config.gridColumnGap);
  }
  private getTrackItemValue(item: trackItem): number {
    if (item.type === '') return item.value;
    if (item.type === 'minmax') {
      const min = item.args[0] as trackItem;
      const max = item.args[1] as trackItem;
      return isFixedBreadth(min) ? min.value : max.value;
    }
    return 0;
  }
  private parseAutoRepeat() {
    const gap = this.gap;
    let size = 0;
    let repeatTrack: trackItem;
    let repeatIndex: number;

    this.trackList.tracks.forEach((item, index) => {
      size += this.getTrackItemValue(item);
      if (isAutoRepeat(item)) {
        repeatTrack = item;
        repeatIndex = index;
      }
    })
    let leaveSpace = this.size - size;
    let repeatSize = 0;
    const repeatList = repeatTrack.args[1] as trackList;
    repeatList.tracks.forEach(item => {
      repeatSize += this.getTrackItemValue(item);
    });
    let count = 1;
    if (leaveSpace > repeatSize) {
      count = Math.floor(leaveSpace / repeatSize);
      if (gap) {
        const fixLength = this.trackList.tracks.length - 1;
        const repeatLength = repeatList.tracks.length;
        while (count > 1) {
          const gapSize = gap * (fixLength + repeatLength * count - 1);
          if (leaveSpace - gapSize - count * repeatSize > 0) {
            break;
          } else {
            count--;
          }
        }
      }
    }
    const repeatResult = this.expandRepeat(repeatTrack, count);
    this.trackList.tracks.splice(repeatIndex, 1, ...repeatResult.tracks);
    if (repeatResult.lineNames.length) {
      if (repeatIndex) {
        this.trackList.tracks[repeatIndex - 1].lineNames.push(...repeatResult.lineNames)
      } else {
        this.trackList.lineNames.push(...repeatResult.lineNames);
      }
    }
  }
  /**
   * parse track list
   * * convert percentage to value
   * * parse fixed repeat
   * * parse auto repeat
   */
  private parseTrackList() {
    const result: trackList = {
      lineNames: this.trackList.lineNames,
      tracks: []
    };
    let repeatLineNames: string[] = [];
    let hasAutoRepeat = false;
    const size = this.size;
    this.trackList.tracks.forEach(item => {
      if (item.type === '%') {
        item.type = '';
        item.value = item.value * size / 100;
        item.baseSize = item.value;
        item.growthLimit = item.value;
      } else if (isFixedRepeat(item)) {
        const repeatResult = this.expandRepeat(item);
        result.tracks.push(...repeatResult.tracks);
        repeatLineNames = repeatResult.lineNames;
        return;
      } else if (isAutoRepeat(item)) {
        hasAutoRepeat = true;
      }
      if (repeatLineNames.length) {
        item.lineNames.push(...repeatLineNames);
        repeatLineNames = [];
      }
      result.tracks.push(item);
    })
    this.trackList = result;
    if (hasAutoRepeat) {
      this.parseAutoRepeat();
    }
  }
}