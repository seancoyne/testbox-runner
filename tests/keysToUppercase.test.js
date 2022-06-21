const keysToUpperCase = require('../lib/keysToUppercase');

test('converts lowercase keys to uppercase keys', () => {
  const input = {
    "name": "John Doe",
    "age": "30",
  }
  const expected = {
    "NAME": "John Doe",
    "AGE": "30",
  }
  expect(keysToUpperCase(input)).toStrictEqual(expected);
});

test('handles an empty object', () => {
  const input = {}
  const expected = {}
  expect(keysToUpperCase(input)).toStrictEqual(expected);
});