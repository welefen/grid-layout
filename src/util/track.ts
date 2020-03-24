import { trackItem } from '../config';

export function isFixedBreadth(value: trackItem): boolean {
  return !value.type || value.type === '%';
}

export function isInflexibleBreadth(value: trackItem): boolean {
  return this.isFixedBreadth(value) || ['min-content', 'max-content', 'auto'].includes(value.type);
}

export function isTrackBreadth(value: trackItem): boolean {
  return this.isInflexibleBreadth(value) || value.type === 'fr';
}

export function isAutoRepeat(value: trackItem): boolean {
  return value.type === 'auto-fill-repeat' || value.type === 'auto-fit-repeat';
}

export function isFixedRepeat(value: trackItem): boolean {
  return value.type === 'fixed-repeat';
}


export function isAutoTrack(track: trackItem): boolean {
  return track.type === 'auto';
}

export function isFrTrack(track: trackItem): boolean {
  return track.type === 'fr';
}

export function isMinMaxTrack(track: trackItem): boolean {
  return track.type === 'minmax';
}

export function isFrMinMaxTrack(track: trackItem): boolean {
  if (isMinMaxTrack(track)) {
    const max = <trackItem>track.args[1];
    return max.type === 'fr';
  }
  return false;
}

export function isAutoMinMaxTrack(track: trackItem): boolean {
  if (isMinMaxTrack(track)) {
    const max = <trackItem>track.args[1];
    return max.type === 'auto';
  }
  return false;
}

/**
 * parse space between items
 * @param {Number} space space size
 * @param {String} type start/end
 * @param {Number} num array size
 */
export function parseSpaceBetween(space: number, type: string, num: number) {
  const marginSize = [];
  const fillFull = (size = 0) => {
    for(let i = marginSize.length; i < num + 1; i++) {
      marginSize[i] = size;
    }
  };
  if(space < 0) {
    if(type === 'space-between' || type === 'stretch') {
      type = 'start';
    } else if(type === 'space-around' || type === 'space-evenly') {
      type = 'center';
    }
  }
  if(type === 'end') {
    marginSize[0] = space;
    fillFull();
  } else if(type === 'center') {
    const itemSize = space / 2;
    marginSize[0] = itemSize;
    fillFull();
    marginSize[num] = itemSize;
  } else if(type === 'space-between') {
    marginSize[0] = 0;
    if(num === 1) {
      fillFull(space);
    } else {
      fillFull(space / (num - 1));
      marginSize[num] = 0;
    }
  } else if(type === 'space-between-reverse') {
    if(num === 1) {
      marginSize[0] = space;
      fillFull(0);
    } else {
      marginSize[0] = 0;
      fillFull(space / (num - 1));
      marginSize[num] = 0;
    }
  } else if(type === 'space-around') {
    const itemSize = space / num;
    marginSize[0] = itemSize / 2;
    fillFull(itemSize);
    marginSize[num] = itemSize / 2;
  } else if(type === 'space-evenly') {
    const itemSize = space / (num + 1);
    fillFull(itemSize);
  } else if(type === 'stretch') {
    const itemSize = space / num;
    marginSize[0] = 0;
    fillFull(itemSize);
  } else {
    fillFull();
  }
  return marginSize;
}