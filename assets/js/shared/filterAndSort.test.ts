import { filterAndSort } from './filterAndSort'

describe('filterAndSort', () => {
  const options = ['Spain', 'Angola', 'China', 'Latvia', 'France']
  const source = filterAndSort(options)
  const populateResults = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('returns original options when query is blank', () => {
    source('', populateResults)
    expect(populateResults).toHaveBeenCalledWith(options)
  })

  test('filters the options', () => {
    source('  an  ', populateResults)
    expect(populateResults).toHaveBeenCalledWith(['Angola', 'France'])
  })

  test('sorts by earliest substring index', () => {
    source('La', populateResults)
    expect(populateResults).toHaveBeenCalledWith(['Latvia', 'Angola'])
  })

  test('no matches returns empty array', () => {
    source('Pluto', populateResults)
    expect(populateResults).toHaveBeenCalledWith([])
  })
})
