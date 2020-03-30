import { deepmerge } from '../util/util';
import { Container } from '../container';
import { TrackList, TrackItem, TrackType } from '../util/config';
import { isFixedBreadth, isAutoRepeat, isFixedRepeat, isAutoFitRepeat } from '../util/track';

export class RepeatTrackCompute {
  trackList: TrackList;
  container: Container;
  type: TrackType;
  constructor(trackList: TrackList, container: Container, type: TrackType) {
    this.trackList = trackList;
    this.container = container;
    this.type = type;
  }
  /**
   * expand fixed repeat to trackList
   * @param track 
   */
  private expandFixedRepeat(track: TrackItem, num?: number): TrackList {
    const repeatNum = <number>(num || track.args[0]);
    const repeatValue = <TrackList>track.args[1];
    const result: TrackList = [];
    let i = 0;
    while (i++ < repeatNum) {
      repeatValue.forEach(item => {
        result.push(deepmerge(item));
      })
    }
    return result;
  }
  get size() {
    return this.type === 'row' ? this.container.config.height : this.container.config.width;
  }
  get gap(): number {
    return <number>(this.type === 'row' ? this.container.config.gridRowGap : this.container.config.gridColumnGap);
  }
  private getTrackItemValue(item: TrackItem): number {
    switch (item.type) {
      case 'px':
        return item.value;
      case '%':
        return Math.round(item.value * this.size / 100);
      case 'minmax':
        const min = <TrackItem>item.args[0];
        const max = <TrackItem>item.args[1];
        return isFixedBreadth(min) ? min.value : max.value;
    }
    return 0;
  }
  private parseAutoRepeat() {
    const gap = this.gap;
    let size = 0;
    let repeatTrack: TrackItem;
    let repeatIndex: number;
    let isAutoFit = false;

    this.trackList.forEach((item, index) => {
      size += this.getTrackItemValue(item);
      if (isAutoRepeat(item)) {
        repeatTrack = item;
        repeatIndex = index;
        isAutoFit = isAutoFitRepeat(item);
      }
    })
    let leaveSpace = this.size - size;
    let repeatSize = 0;
    const repeatList = <TrackList>repeatTrack.args[1];
    repeatList.forEach(item => {
      repeatSize += this.getTrackItemValue(item);
    });
    let count = 1;
    if (leaveSpace > repeatSize) {
      count = Math.floor(leaveSpace / repeatSize);
      if (gap) {
        const fixLength = this.trackList.length - 1;
        const repeatLength = repeatList.length;
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
    const repeatResult = this.expandFixedRepeat(repeatTrack, count);
    // auto-fit repeat
    if (isAutoFit) {
      repeatResult.forEach(item => {
        item.autoFit = true;
      })
    }
    this.trackList.splice(repeatIndex, 1, ...repeatResult);
  }
  /**
   * merge lineNames, lineNamesEnd equal to net lineNamesStart
   */
  private mergeLineNames(): void {
    const length = this.trackList.length;
    for (let i = 0; i < length - 1; i++) {
      const current = this.trackList[i];
      const next = this.trackList[i + 1];
      const lineNames = current.lineNamesEnd.concat(next.lineNamesStart);
      const set = new Set(lineNames);
      current.lineNamesEnd = [...set];
      next.lineNamesStart = [...set];
    }
  }
  /**
   * parse track list
   * * convert percentage to value
   * * parse fixed repeat
   * * parse auto repeat
   */
  parse() {
    const result: TrackList = [];
    let hasAutoRepeat = false;
    this.trackList.forEach(item => {
      if (isFixedRepeat(item)) {
        result.push(...this.expandFixedRepeat(item));
        return;
      } else if (isAutoRepeat(item)) {
        hasAutoRepeat = true;
      }
      result.push(item);
    })
    this.trackList = result;
    if (hasAutoRepeat) {
      this.parseAutoRepeat();
    }
    this.mergeLineNames();
  }
}