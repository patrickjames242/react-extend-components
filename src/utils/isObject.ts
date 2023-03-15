export function isObject(v: any): v is object {
  return v !== null && typeof v === 'object';
}
