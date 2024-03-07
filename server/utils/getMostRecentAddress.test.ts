import { addDays, subDays, format } from 'date-fns'
import Address from '../data/interfaces/prisonApi/Address'
import { getMostRecentAddress } from './getMostRecentAddress'

describe('getMostRecentAddress', () => {
  const formatDate = (date: Date): string => format(date, 'yyyy-MM-dd')
  const dateInThePast = (days: number): string => formatDate(subDays(new Date(), days))

  describe('Given undefined', () => {
    it('returns undefined', () => {
      expect(getMostRecentAddress(undefined)).toBeUndefined()
    })
  })

  describe('Given no addresses', () => {
    it('returns undefined', () => {
      const addresses: Address[] = []
      expect(getMostRecentAddress(addresses)).toBeUndefined()
    })
  })

  describe('Given no active addresses', () => {
    it('returns undefined', () => {
      const addresses: Address[] = [
        { primary: true, noFixedAddress: false, endDate: dateInThePast(3) },
        { primary: false, noFixedAddress: false, endDate: dateInThePast(30) },
      ]

      expect(getMostRecentAddress(addresses)).toBeUndefined()
    })
  })

  describe('Given active addresses', () => {
    describe('and there is a primary address', () => {
      describe('with no end date', () => {
        it('returns the primary address', () => {
          const addresses: Address[] = [
            { primary: false, noFixedAddress: false, premise: 'Some address' },
            { primary: true, noFixedAddress: false, premise: 'Example address' },
          ]

          expect(getMostRecentAddress(addresses)).toEqual(addresses[1])
        })
      })

      describe('with an end date in the future', () => {
        it('returns the primary address', () => {
          const endDate: string = formatDate(addDays(new Date(), 3))
          const addresses: Address[] = [
            { primary: false, noFixedAddress: false, premise: 'Some address', endDate },
            { primary: true, noFixedAddress: false, premise: 'Example address', endDate },
          ]

          expect(getMostRecentAddress(addresses)).toEqual(addresses[1])
        })
      })
    })

    describe('and no primary address', () => {
      describe('and there is a home address', () => {
        it.each(['home', 'HOME', 'HoMe'])('returns the home address (type: %s)', (type: string) => {
          const addresses: Address[] = [
            { primary: false, noFixedAddress: false, premise: 'Some other address', addressType: 'away' },
            { primary: false, noFixedAddress: false, premise: 'Some address', addressType: type },
          ]

          expect(getMostRecentAddress(addresses)).toEqual(addresses[1])
        })
      })
      describe('and there are multiple home addresses', () => {
        it('returns the one with the earliest start date', () => {
          const addresses: Address[] = [
            {
              primary: false,
              noFixedAddress: false,
              premise: 'Some other address',
              addressType: 'home',
              startDate: dateInThePast(3),
            },
            {
              primary: false,
              noFixedAddress: false,
              premise: 'Some address',
              addressType: 'home',
              startDate: dateInThePast(30),
            },
          ]

          expect(getMostRecentAddress(addresses)).toEqual(addresses[1])
        })
      })
      describe('and no addresses are a home address', () => {
        describe('and there is one address', () => {
          it('returns the address', () => {
            const addresses: Address[] = [{ primary: false, noFixedAddress: false, premise: 'Some other address' }]

            expect(getMostRecentAddress(addresses)).toEqual(addresses[0])
          })
        })

        describe('and there are multiple addresses', () => {
          it('returns the one with the earliest start date', () => {
            const addresses: Address[] = [
              {
                primary: false,
                noFixedAddress: false,
                premise: 'Some other address',
                startDate: dateInThePast(3),
              },
              {
                primary: false,
                noFixedAddress: false,
                premise: 'Some address',
                startDate: dateInThePast(30),
              },
            ]

            expect(getMostRecentAddress(addresses)).toEqual(addresses[1])
          })
        })
      })
    })
  })
})
