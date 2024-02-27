import { addDays } from 'date-fns'
import { AlertValidator } from './alertValidator'
import { formatDate } from '../utils/dateHelpers'

describe('Validation middleware', () => {
  it('should pass validation with good data', async () => {
    const alertForm = {
      alertType: 'TYPE',
      alertCode: 'CODE',
      comment: 'Note text',
      alertDate: formatDate(new Date().toISOString(), 'short'),
      expiryDate: formatDate(addDays(new Date(), 10).toISOString(), 'short'),
    }

    const result = AlertValidator(alertForm)

    expect(result).toEqual([])
  })

  it('should fail validation with no data', async () => {
    const alertForm = {
      alertType: '',
      alertCode: '',
      comment: '',
      alertDate: '',
    }

    const result = AlertValidator(alertForm)

    expect(result).toEqual([
      { text: 'Select the alert type', href: '#alertType' },
      { text: 'Select the alert code', href: '#alertCode' },
      { text: 'Enter why you are creating this alert', href: '#comment' },
      { text: 'Select the alert start date', href: '#alertDate' },
    ])
  })

  it('should fail validation with bad data', async () => {
    const alertForm = {
      alertType: 'X',
      alertCode: 'X',
      comment:
        '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',
      alertDate: 'ABCDEF',
    }

    const result = AlertValidator(alertForm)

    expect(result).toEqual([
      { text: 'Enter why you are creating this alert using 1,000 characters or less', href: '#comment' },
      { text: 'Enter a real date in the format DD/MM/YYYY - for example, 27/03/2023', href: '#alertDate' },
    ])
  })

  it('should fail validation with future date', async () => {
    const alertForm = {
      alertType: 'X',
      alertCode: 'X',
      comment: 'X',
      alertDate: '01/01/9999',
    }

    const result = AlertValidator(alertForm)

    expect(result).toEqual([
      {
        text: 'Enter a date which is not in the future in the format DD/MM/YYYY - for example, 27/03/2020',
        href: '#alertDate',
      },
    ])
  })

  it('should fail validation with date more than 7 days in the past', async () => {
    const alertForm = {
      alertType: 'X',
      alertCode: 'X',
      comment: 'X',
      alertDate: '01/01/2000',
    }

    const result = AlertValidator(alertForm)

    expect(result).toEqual([
      {
        text: 'Enter a date that is not more than 7 days in the past in the format DD/MM/YYYY - for example, 27/03/2020',
        href: '#alertDate',
      },
    ])
  })

  it.each([
    ['on', '01/01/2000'],
    ['before', '01/01/1999'],
  ])('should fail validation with expiry date %s the start date', async (_, expiryDate) => {
    const alertForm = {
      alertType: 'X',
      alertCode: 'X',
      comment: 'X',
      alertDate: '01/01/2000',
      expiryDate,
    }

    const result = AlertValidator(alertForm)

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          text: "'Alert end date' must be later than the start date",
          href: '#expiryDate',
        }),
      ]),
    )
  })
})
