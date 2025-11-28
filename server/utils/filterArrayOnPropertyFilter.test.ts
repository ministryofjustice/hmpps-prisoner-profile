import filterArrayOnPropertyFilter from './filterArrayOnPropertyFilter'

describe('filterArrayOnPropertyFilter', () => {
  it('should filter an array on a specified property and value', () => {
    // Given
    const arrayOfThings = [
      { name: 'thing1', value: 'value1', active: true },
      { name: 'thing2', value: 'value2', active: false },
      { name: 'thing3', value: 'value3', active: true },
    ]

    const expected = [
      { name: 'thing1', value: 'value1', active: true },
      { name: 'thing3', value: 'value3', active: true },
    ]

    // When
    const actual = filterArrayOnPropertyFilter(arrayOfThings, 'active', true)

    // Then
    expect(actual).toEqual(expected)
  })
})
