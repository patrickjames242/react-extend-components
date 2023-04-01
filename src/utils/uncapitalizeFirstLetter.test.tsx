import { uncapitalizeFirstLetter } from './uncapitalizeFirstLetter';

test('uncapitalizes first letter', () => {
  expect(uncapitalizeFirstLetter('Hello')).toBe('hello');
  expect(uncapitalizeFirstLetter('Patrick is the best programmer')).toBe(
    'patrick is the best programmer'
  );

  expect(uncapitalizeFirstLetter('')).toBe('');
  expect(uncapitalizeFirstLetter(' ')).toBe(' ');
  expect(uncapitalizeFirstLetter('Blah blah')).toBe('blah blah');
});
