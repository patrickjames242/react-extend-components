export function uncapitalizeFirstLetter<Str extends string>(
  str: Str
): Uncapitalize<Str> {
  return (str.charAt(0).toLowerCase() + str.slice(1)) as any;
}
