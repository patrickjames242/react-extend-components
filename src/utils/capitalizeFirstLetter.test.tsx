import { capitalizeFirstLetter } from './capitalizeFirstLetter';

test('capitalizes first letter', () => {
  expect(capitalizeFirstLetter('hello')).toBe('Hello');
  expect(capitalizeFirstLetter('patrick is the best programmer')).toBe(
    'Patrick is the best programmer'
  );

  expect(capitalizeFirstLetter('')).toBe('');
  expect(capitalizeFirstLetter(' ')).toBe(' ');
  expect(capitalizeFirstLetter('Blah blah')).toBe('Blah blah');
});
