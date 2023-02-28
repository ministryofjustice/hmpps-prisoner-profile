import { pluralise } from './pluralise'

describe('pluralise a word', () => {
  it.each([
    ['Standard word, no options - singular count', 1, 'cat', undefined, '1 cat'],
    ['Standard word, no options - plural count', 2, 'cat', undefined, '2 cats'],
    ['Standard word, no options - zero count', 0, 'cat', undefined, '0 cats'],
    ['Standard word, no options - negative singular count', -1, 'cat', undefined, '-1 cat'],
    ['Standard word, no options - negative plural count', -7, 'cat', undefined, '-7 cats'],
    ['Standard word, forced plural - plural count', 3, 'cat', { plural: 'kittens' }, '3 kittens'],
    ['Standard word, no includeCount - plural count', 4, 'cat', { includeCount: false }, 'cats'],
    ['Standard word, empty message - zero count', 0, 'cat', { emptyMessage: 'No cats' }, 'No cats'],
    ['Standard word, empty message - non-zero count', 2, 'cat', { emptyMessage: 'No cats' }, '2 cats'],
    ['Non-standard word, no options - plural count', 2, 'person', undefined, '2 people'],
    ['Non-standard word, forced plural - plural count', 4, 'person', { plural: 'humans' }, '4 humans'],
    ['Non-standard word, no includeCount - plural count', 4, 'person', { includeCount: false }, 'people'],
    [
      'Non-standard word, forced plural, no includeCount - plural count',
      4,
      'person',
      { plural: 'humans', includeCount: false },
      'humans',
    ],
    ['Non-standard word, empty message - plural count', 0, 'person', { emptyMessage: 'Nobody here' }, 'Nobody here'],
    ['Standard word, multiple - singular count', 1, 'active punishment', undefined, '1 active punishment'],
    ['Standard word, multiple - plural count', 2, 'active punishment', undefined, '2 active punishments'],
  ])(
    '%s pluralise(%s, %s, %s)',
    (_: string, count: number, word: string, options: { [key: string]: string | boolean }, expected: string) => {
      expect(pluralise(count, word, options)).toEqual(expected)
    },
  )
})
