import { startOfDay } from 'date-fns'
import dateComparator from './dateComparator'

describe('dateComparator', () => {
  describe('descending order', () => {
    it('should determine if 2 dates are equal', () => {
      // Given
      const date1 = startOfDay(new Date('2023-08-14'))
      const date2 = startOfDay(new Date('2023-08-14'))

      // When
      const actual = dateComparator(date1, date2, 'DESC')

      // Then
      expect(actual).toBe(0)
    })

    it('should determine if a date is before another', () => {
      // Given
      const date1 = new Date('2023-08-13')
      const date2 = new Date('2023-08-14')

      // When
      const actual = dateComparator(date1, date2, 'DESC')

      // Then
      expect(actual).toBe(1)
    })

    it('should determine if a date is after another', () => {
      // Given
      const date1 = new Date('2023-08-15')
      const date2 = new Date('2023-08-14')

      // When
      const actual = dateComparator(date1, date2, 'DESC')

      // Then
      expect(actual).toBe(-1)
    })
  })

  describe('ascending order', () => {
    it('should determine if 2 dates are equal', () => {
      // Given
      const date1 = startOfDay(new Date('2023-08-14'))
      const date2 = startOfDay(new Date('2023-08-14'))

      // When
      const actual = dateComparator(date1, date2, 'ASC')

      // Then
      expect(actual).toBe(0)
    })

    it('should determine if a date is before another', () => {
      // Given
      const date1 = new Date('2023-08-13')
      const date2 = new Date('2023-08-14')

      // When
      const actual = dateComparator(date1, date2, 'ASC')

      // Then
      expect(actual).toBe(-1)
    })

    it('should determine if a date is after another', () => {
      // Given
      const date1 = new Date('2023-08-15')
      const date2 = new Date('2023-08-14')

      // When
      const actual = dateComparator(date1, date2, 'ASC')

      // Then
      expect(actual).toBe(1)
    })
  })
})
