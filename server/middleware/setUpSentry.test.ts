import { anonymise } from './setUpSentry'

describe('Sentry anonymisation', () => {
  it.each([
    ['http://localhost/prisoner/some-other-url', 'http://localhost/prisoner/some-other-url'],
    ['http://localhost/prisoner/A1234AA', 'http://localhost/prisoner/:prisonerNumber'],
    ['http://localhost/prisoner/A1111AA/and/A2222BB', 'http://localhost/prisoner/:prisonerNumber/and/:prisonerNumber'],
    ['GET /prisoner/A1234AA', 'GET /prisoner/:prisonerNumber'],
  ])('should replace prisoner numbers in “%s”', (urlLike, expected) => {
    expect(anonymise(urlLike)).toEqual(expected)
  })

  it.each([
    ['http://localhost/api/addresses/find', 'http://localhost/api/addresses/find'],
    ['http://localhost/api/addresses/find/SW1H9AJ', 'http://localhost/api/addresses/find/:query'],
    ['http://localhost/api/addresses/find/SW1H%209AJ', 'http://localhost/api/addresses/find/:query'],
    ['http://localhost/api/addresses/find/SW1H+9AJ', 'http://localhost/api/addresses/find/:query'],
    ['http://localhost/api/addresses/find/SW1H%209AJ?param=1', 'http://localhost/api/addresses/find/:query?param=1'],
    [
      `http://localhost/api/addresses/find/${encodeURIComponent('sw1h 9aj')}?param=2`,
      'http://localhost/api/addresses/find/:query?param=2',
    ],
    ['GET /api/addresses/find', 'GET /api/addresses/find'],
    ['GET /api/addresses/find/SW1H9AJ', 'GET /api/addresses/find/:query'],
  ])('should replace address query in “%s”', (urlLike, expected) => {
    expect(anonymise(urlLike)).toEqual(expected)
  })
})
