import { religionValidator } from './religionValidator'

describe('Religion validators', () => {
  describe('Prisoner without existing religion', () => {
    it.each([{}, { religion: 'ZORO' }])('Valid: %s', async ({ religion }) => {
      const body = { religion }
      const errors = await religionValidator(body)
      expect(errors.length).toEqual(0)
    })
  })

  describe('Prisoner with existing religion', () => {
    const messageExceedingMaxLength = 'a'.repeat(4001)
    it.each([
      { religion: 'ZORO', reasonKnown: 'NO' },
      {
        religion: 'ZORO',
        reasonKnown: 'NO',
        reasonForChangeUnknown: 'Not sure',
      },
      {
        religion: 'ZORO',
        reasonKnown: 'YES',
        reasonForChange: 'Some reason',
      },
    ])('Valid: %s', async ({ religion, reasonKnown, reasonForChange, reasonForChangeUnknown }) => {
      const body = { religion, reasonKnown, reasonForChange, reasonForChangeUnknown, currentReligionCode: 'DRU' }
      const errors = await religionValidator(body)
      expect(errors.length).toEqual(0)
    })

    it.each([
      [{ reasonKnown: 'NO' }, `Select this person's religion, faith or belief`, '#religion'],
      [
        { religion: 'ZORO' },
        `Select yes if you know why this person's religion, faith or belief has changed`,
        '#reasonKnown',
      ],
      [
        { religion: 'ZORO', reasonKnown: 'YES' },
        `Enter why this person's religion, faith or belief has changed`,
        '#reasonForChange',
      ],
      [
        { religion: 'ZORO', reasonKnown: 'YES', reasonForChange: messageExceedingMaxLength },
        `The reason why this person's religion, faith or belief has changed must be 4,000 characters or less`,
        '#reasonForChange',
      ],
      [
        { religion: 'ZORO', reasonKnown: 'NO', reasonForChangeUnknown: messageExceedingMaxLength },
        `The details about this change must be 4,000 characters or less`,
        '#reasonForChange',
      ],
    ])(
      'Validations: %s: %s',
      async (
        {
          religion,
          reasonKnown,
          reasonForChange,
          reasonForChangeUnknown,
        }: { religion: string; reasonKnown: string; reasonForChange: string; reasonForChangeUnknown: string },
        errorMessage: string,
        errorHref: string,
      ) => {
        const body = {
          religion,
          reasonKnown,
          reasonForChange,
          reasonForChangeUnknown,
          currentReligionCode: 'DRU',
        }
        const errors = await religionValidator(body)

        expect(errors.length).toEqual(1)
        expect(errors[0].text).toEqual(errorMessage)
        expect(errors[0].href).toEqual(errorHref)
      },
    )
  })
})
