import {
  deleteAtPath,
  getAtPath,
  getPathRelativeToOtherPath,
  setAtPath,
} from './getAndSetAtPath';

describe('getAtPath', () => {
  test('gets value when value is present', () => {
    const obj = {
      a: {
        b: {
          c: 1,
        },
      },
    };
    expect(getAtPath(obj, ['a', 'b', 'c'])).toBe(1);
  });

  test("returns undefined when value isn't present", () => {
    const obj = {
      a: {
        b: {
          c: 1,
        },
      },
    };
    expect(getAtPath(obj, ['c', 'f', 'g'])).toBeUndefined();
  });

  test('returns object when path is empty', () => {
    const obj = {
      a: {
        b: {
          c: 1,
        },
      },
    };
    expect(getAtPath(obj, [])).toBe(obj);
  });
});

describe('setAtPath', () => {
  test('sets value', () => {
    const obj: any = {
      a: {
        b: {
          c: 1,
        },
      },
    };
    setAtPath(obj, ['a', 'b', 'c'], 'blah');
    expect(obj).toEqual({
      a: {
        b: {
          c: 'blah',
        },
      },
    });
  });
  test("sets value when intermediate values aren't present", () => {
    const obj: any = {
      a: {
        b: {
          c: 1,
        },
      },
    };
    setAtPath(obj, ['c', 'p', 'd'], 2);
    expect(obj).toEqual({
      a: {
        b: {
          c: 1,
        },
      },
      c: {
        p: {
          d: 2,
        },
      },
    });
  });
});

describe('deleteAtPath', () => {
  test("deletes value when it's present", () => {
    const obj: any = {
      a: {
        b: {
          c: 1,
        },
      },
    };
    deleteAtPath(obj, ['a', 'b', 'c']);
    expect(obj).toEqual({
      a: {
        b: {},
      },
    });
  });

  test("doesn't delete value when it's not present", () => {
    const obj: any = {
      a: {
        b: {
          c: 1,
        },
      },
    };
    deleteAtPath(obj, ['c', 'p', 'd']);
    expect(obj).toEqual({
      a: {
        b: {
          c: 1,
        },
      },
    });
  });
});

describe('getPathRelativeToOtherPath', () => {
  test('returns path relative to another path', () => {
    expect(getPathRelativeToOtherPath(['a', 'b', 'c'], ['a', 'b'])).toEqual([
      'c',
    ]);
    expect(getPathRelativeToOtherPath(['a', 'b', 'c'], ['a'])).toEqual([
      'b',
      'c',
    ]);
  });

  test("returns null when paths don't share a common ancestor", () => {
    expect(getPathRelativeToOtherPath(['a', 'b', 'c'], ['a', 'c'])).toBeNull();
  });

  test('returns original path when relativeToPath is an empty array', () => {
    expect(getPathRelativeToOtherPath(['a', 'b', 'c'], [])).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  test('returns an empty array when originalPath is an empty array', () => {
    expect(getPathRelativeToOtherPath([], ['a', 'b', 'c'])).toEqual([]);
  });
});
