import { PropPath } from '../types';

export function normalizePropPath(path: PropPath): string[] {
  if (typeof path === 'string') {
    return [path];
  } else {
    return path;
  }
}
