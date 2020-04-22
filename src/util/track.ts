import { TrackItem } from './config';

export function isFixedBreadth(value: TrackItem): boolean {
  return value.type === 'px' || value.type === '%';
}

export function isInflexibleBreadth(value: TrackItem): boolean {
  return isFixedBreadth(value) || ['min-content', 'max-content', 'auto'].includes(value.type);
}

export function isTrackBreadth(value: TrackItem): boolean {
  return isInflexibleBreadth(value) || value.type === 'fr';
}

export function isAutoRepeat(value: TrackItem): boolean {
  return value.type === 'auto-fill-repeat' || value.type === 'auto-fit-repeat';
}

export function isAutoFitRepeat(value: TrackItem): boolean {
  return value.type === 'auto-fit-repeat';
}

export function isFixedRepeat(value: TrackItem): boolean {
  return value.type === 'fix-repeat';
}


export function isAutoTrack(track: TrackItem): boolean {
  return track.type === 'auto';
}

export function isFrTrack(track: TrackItem): boolean {
  return track.type === 'fr';
}

export function isMinMaxTrack(track: TrackItem): boolean {
  return track.type === 'minmax';
}

export function isFrMinMaxTrack(track: TrackItem): boolean {
  if (isMinMaxTrack(track)) {
    const max = <TrackItem>track.args[1];
    return max.type === 'fr';
  }
  return false;
}

export function isAutoMinMaxTrack(track: TrackItem): boolean {
  if (isMinMaxTrack(track)) {
    const max = <TrackItem>track.args[1];
    return max.type === 'auto';
  }
  return false;
}
