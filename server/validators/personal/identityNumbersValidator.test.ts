import { addIdentityNumbersValidator, editIdentityNumberValidator } from './identityNumbersValidator'

import { OffenderIdentifierType } from '../../data/interfaces/prisonApi/OffenderIdentifierType'

describe('AddIdentityNumbersValidator', () => {
  it('Valid data', () => {
    const request = {
      pnc: {
        value: '2002/0073319Z',
        comment: 'Some comment',
      },
      cro: {
        value: '097501/98T',
      },
    }
    const errors = addIdentityNumbersValidator(request)
    expect(errors.length).toEqual(0)
  })

  describe('Maximum value length exceeded', () => {
    it.each([
      ['CRO Number', 'cro', '097501/98T'],
      ['PNC Number', 'pnc', '2002/0073319Z'],
      ['Prison legacy system number', 'prisonLegacySystem'],
      ['Probation legacy system number', 'probationLegacySystem'],
      ['Scottish PNC number', 'scottishPnc'],
      ['Youth Justice Application Framework (YJAF) number', 'yjaf'],
    ])('%s', (_, id, validValue = '1'.repeat(20)) => {
      const validRequest = {
        [id]: { value: validValue },
      }
      const invalidRequest = {
        [id]: { value: '1'.repeat(21) },
      }

      const validErrors = addIdentityNumbersValidator(validRequest)
      expect(validErrors.length).toEqual(0)

      const errors = addIdentityNumbersValidator(invalidRequest)
      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual('Enter the ID number using 20 characters or less')
      expect(errors[0].href).toEqual(`#${id}-value-input`)
    })
  })

  describe('Maximum comment length exceeded', () => {
    it.each([
      ['CRO Number', 'cro', '097501/98T'],
      ['PNC Number', 'pnc', '2002/0073319Z'],
      ['Prison legacy system number', 'prisonLegacySystem'],
      ['Probation legacy system number', 'probationLegacySystem'],
      ['Scottish PNC number', 'scottishPnc'],
      ['Youth Justice Application Framework (YJAF) number', 'yjaf'],
    ])('%s', (_, id, value = '123') => {
      const validRequest = {
        [id]: { value, comment: 'a'.repeat(240) },
      }
      const invalidRequest = {
        [id]: { value, comment: 'a'.repeat(241) },
      }

      const validErrors = addIdentityNumbersValidator(validRequest)
      expect(validErrors.length).toEqual(0)

      const errors = addIdentityNumbersValidator(invalidRequest)
      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual('Enter your comment using 240 characters or less')
      expect(errors[0].href).toEqual(`#${id}-comments-input`)
    })
  })

  describe('Selected but no value provided', () => {
    it.each([
      ['CRO number', 'cro'],
      ['PNC number', 'pnc'],
      ['Prison legacy system number', 'prisonLegacySystem'],
      ['Probation legacy system number', 'probationLegacySystem'],
      ['Scottish PNC number', 'scottishPnc'],
      ['Youth Justice Application Framework (YJAF) number', 'yjaf'],
    ])('%s', (label, id) => {
      const request = {
        [id]: { selected: id },
      }

      const errors = addIdentityNumbersValidator(request)
      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual(`Enter this person’s ${label}`)
      expect(errors[0].href).toEqual(`#${id}-value-input`)
    })
  })

  describe('PNC validation', () => {
    it.each([
      ['123', false],
      ['20000160946Q', true],
      ['2000/0160946Q', true],
      ['1999/0139097Y', true],
      ['2024/0070623D', true],
      ['81/34U', true],
      ['02/73319Z', true],
      ['00/223R', true],
      ['03/3Y', true],
      ['033Y', true],
      ['2024/0070623D', true],
    ])('%s', (pnc, isValid) => {
      const request = {
        pnc: { value: pnc },
      }

      const errors = addIdentityNumbersValidator(request)

      if (isValid) {
        expect(errors.length).toEqual(0)
      } else {
        expect(errors.length).toEqual(1)
        expect(errors[0].text).toEqual(
          'Enter a PNC number in the correct format, exactly as it appears on the document',
        )
        expect(errors[0].href).toEqual(`#pnc-value-input`)
      }
    })
  })

  describe('CRO validation', () => {
    it.each([
      ['123', false],
      ['SF05482703J', false],
      ['SF05/482703J', true],
      ['SF83/50058Z', true],
      ['265416/21G', true],
      ['65656/91H', true],
      ['065656/91H', true],
      ['6697/56U', true],
      ['991/66G', true],
      ['99166G', false],
    ])('%s', (cro, isValid) => {
      const request = {
        cro: { value: cro },
      }

      const errors = addIdentityNumbersValidator(request)

      if (isValid) {
        expect(errors.length).toEqual(0)
      } else {
        expect(errors.length).toEqual(1)
        expect(errors[0].text).toEqual(
          'Enter a CRO number in the correct format, exactly as it appears on the document',
        )
        expect(errors[0].href).toEqual(`#cro-value-input`)
      }
    })
  })
})

describe('EditIdentityNumberValidator', () => {
  it('Valid data', () => {
    const request = {
      value: '123',
      comment: 'Some comment',
      type: 'TYPE',
    }
    const errors = editIdentityNumberValidator(request)
    expect(errors.length).toEqual(0)
  })

  it('Maximum value length exceeded', () => {
    const validRequest = {
      value: '1'.repeat(20),
      type: 'TYPE',
    }
    const invalidRequest = {
      value: '1'.repeat(21),
      type: 'TYPE',
    }

    const validErrors = editIdentityNumberValidator(validRequest)
    expect(validErrors.length).toEqual(0)

    const errors = editIdentityNumberValidator(invalidRequest)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('Enter the ID number using 20 characters or less')
    expect(errors[0].href).toEqual(`#identifier-value-input`)
  })

  it('Maximum comment length exceeded', () => {
    const validRequest = {
      value: '123',
      comment: 'a'.repeat(240),
      type: 'TYPE',
    }
    const invalidRequest = {
      value: '123',
      comment: 'a'.repeat(241),
      type: 'TYPE',
    }

    const validErrors = editIdentityNumberValidator(validRequest)
    expect(validErrors.length).toEqual(0)

    const errors = editIdentityNumberValidator(invalidRequest)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('Enter your comment using 240 characters or less')
    expect(errors[0].href).toEqual(`#identifier-comments-input`)
  })

  it('No value provided', () => {
    const errors = editIdentityNumberValidator({})
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual(`Enter a number`)
    expect(errors[0].href).toEqual(`#identifier-value-input`)
  })

  describe('PNC validation', () => {
    it.each([
      ['123', false],
      ['20000160946Q', true],
      ['2000/0160946Q', true],
      ['1999/0139097Y', true],
      ['2024/0070623D', true],
      ['81/34U', true],
      ['02/73319Z', true],
      ['00/223R', true],
      ['03/3Y', true],
      ['033Y', true],
      ['2024/0070623D', true],
    ])('%s', (pnc, isValid) => {
      const request = {
        value: pnc,
        type: OffenderIdentifierType.PncNumber,
      }

      const errors = editIdentityNumberValidator(request)

      if (isValid) {
        expect(errors.length).toEqual(0)
      } else {
        expect(errors.length).toEqual(1)
        expect(errors[0].text).toEqual(
          'Enter a PNC number in the correct format, exactly as it appears on the document',
        )
        expect(errors[0].href).toEqual(`#identifier-value-input`)
      }
    })
  })

  describe('CRO validation', () => {
    it.each([
      ['123', false],
      ['SF05482703J', false],
      ['SF05/482703J', true],
      ['SF83/50058Z', true],
      ['265416/21G', true],
      ['65656/91H', true],
      ['065656/91H', true],
      ['6697/56U', true],
      ['991/66G', true],
      ['99166G', false],
    ])('%s', (cro, isValid) => {
      const request = {
        value: cro,
        type: OffenderIdentifierType.CroNumber,
      }

      const errors = editIdentityNumberValidator(request)

      if (isValid) {
        expect(errors.length).toEqual(0)
      } else {
        expect(errors.length).toEqual(1)
        expect(errors[0].text).toEqual(
          'Enter a CRO number in the correct format, exactly as it appears on the document',
        )
        expect(errors[0].href).toEqual(`#identifier-value-input`)
      }
    })
  })
})
