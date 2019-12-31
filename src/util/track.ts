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