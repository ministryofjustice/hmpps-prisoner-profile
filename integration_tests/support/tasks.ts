import { formatDate } from '../../server/utils/dateHelpers'
import { calculateAge } from '../../server/utils/utils'

/**
 * Helpers from the server-side sometimes need to be used via cypress tasks
 * because they cannot be compiled by webpack 5+ to work in the browser.
 * A notable culprit is bunyan being imported in the same module as said helper is defined.
 */
export default {
  formatDate({
    date,
    style,
    emptyReturnValue,
  }: {
    date: string | Date
    style?: 'short' | 'full' | 'long' | 'medium'
    emptyReturnValue?: string
  }) {
    return formatDate(date instanceof Date ? date.toISOString() : date, style, emptyReturnValue)
  },

  calculateAge(dob: string | Date) {
    return calculateAge(dob instanceof Date ? dob.toISOString().split('T')[0] : dob)
  },
}
