export function mergeRefs<T = any>(
  ...refs: Array<
    React.MutableRefObject<T> | React.LegacyRef<T> | undefined | null
  >
): React.RefCallback<T> | undefined {
  if (!refs.some((x) => x != null)) return undefined; // if there are only null or undefined elements in the array we return undefined
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
}
