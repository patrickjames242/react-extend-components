import { PropPath } from '../../../types';
import { normalizePropPath } from '../../../utils/normalizePropPath';

export function getAtPath(obj: any, path: PropPath): any | undefined {
  if (Array.isArray(path) && path.length === 0) return obj;
  path = normalizePropPath(path);
  let current = obj;
  for (const pathSeg of path) {
    if (pathSeg in current === false) return undefined;
    current = current[pathSeg];
  }
  return current;
}

export function setAtPath(obj: any, path: PropPath, value: any): void {
  if (Array.isArray(path) && path.length === 0) return;
  path = normalizePropPath(path);
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    current = current[path[i]!] ?? (current[path[i]!] = {});
  }
  current[path[path.length - 1]!] = value;
}

export function deleteAtPath(obj: any, path: PropPath): void {
  if (Array.isArray(path) && path.length === 0) return;
  path = normalizePropPath(path);
  let current = obj;
  for (let i = 0; i < path.length; i++) {
    const pathSeg = path[i]!;
    if (pathSeg in current === false) return;
    if (i === path.length - 1) delete current[pathSeg];
    else current = current[pathSeg];
  }
}

/**
 * @param originalPath The original path
 * @param relativeToPath The path to move the `fromPath` to
 * @returns A new path relative to the relativeToPath
 */
export function getPathRelativeToOtherPath(
  originalPath: PropPath,
  relativeToPath: PropPath
): PropPath | null {
  if (
    (Array.isArray(originalPath) && originalPath.length === 0) ||
    (Array.isArray(relativeToPath) && relativeToPath.length === 0)
  )
    return originalPath;
  originalPath = normalizePropPath(originalPath);
  relativeToPath = normalizePropPath(relativeToPath);
  const remainingFromPath = [...originalPath];
  for (let i = 0; i < relativeToPath.length; i++) {
    const toPathSeg = relativeToPath[i]!;
    if (remainingFromPath[0] === toPathSeg) remainingFromPath.shift();
    else return null;
  }
  return remainingFromPath;
}
