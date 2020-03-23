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