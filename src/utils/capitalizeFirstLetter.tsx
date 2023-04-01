export function capitalizeFirstLetter<Str extends string>(
  str: Str
): Capitalize<Str> {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as any;
}
