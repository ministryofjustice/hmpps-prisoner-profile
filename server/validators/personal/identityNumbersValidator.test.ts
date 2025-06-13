import { identityNumbersValidator } from './identityNumbersValidator'

describe('Identity Numbers Validator', () => {
  const defaultSuccessBody = {
    pnc: {
      value: '2002/0073319Z',
      comment: 'Some comment',
    },
    cro: {
      value: '097501/98T',
    },
  }

  it('Valid data', async () => {
    const errors = await identityNumbersValidator(defaultSuccessBody)
    expect(errors.length).toEqual(0)
  })

  it.each([
    ['CRO Number', 'cro'],
    ['PNC Number', 'pnc'],
    ['Prison legacy system number', 'prisonLegacySystem'],
    ['Probation legacy system number', 'probationLegacySystem'],
    ['Scottish PNC number', 'scottishPnc'],
    ['Youth Justice Application Framework (YJAF) number', 'yjaf'],
  ])('Maximum value length exceeded: %s', async (_, id) => {
    const validRequest = {
      [id]: { value: '1'.repeat(20) },
    }
    const invalidRequest = {
      [id]: { value: '1'.repeat(21) },
    }

    const validErrors = await identityNumbersValidator(validRequest)
    expect(validErrors.length).toEqual(0)

    const errors = await identityNumbersValidator(invalidRequest)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('Enter the ID number using 20 characters or less')
    expect(errors[0].href).toEqual(`#${id}-value-input`)
  })

  it.each([
    ['CRO Number', 'cro'],
    ['PNC Number', 'pnc'],
    ['Prison legacy system number', 'prisonLegacySystem'],
    ['Probation legacy system number', 'probationLegacySystem'],
    ['Scottish PNC number', 'scottishPnc'],
    ['Youth Justice Application Framework (YJAF) number', 'yjaf'],
  ])('Maximum comment length exceeded: %s', async (_, id) => {
    const validRequest = {
      [id]: { value: '123', comment: 'a'.repeat(240) },
    }
    const invalidRequest = {
      [id]: { value: '123', comment: 'a'.repeat(241) },
    }

    const validErrors = await identityNumbersValidator(validRequest)
    expect(validErrors.length).toEqual(0)

    const errors = await identityNumbersValidator(invalidRequest)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('Enter your comment using 240 characters or less')
    expect(errors[0].href).toEqual(`#${id}-comments-input`)
  })

  it.each([
    ['CRO number', 'cro'],
    ['PNC number', 'pnc'],
    ['Prison legacy system number', 'prisonLegacySystem'],
    ['Probation legacy system number', 'probationLegacySystem'],
    ['Scottish PNC number', 'scottishPnc'],
    ['Youth Justice Application Framework (YJAF) number', 'yjaf'],
  ])('Selected but no value provided: %s', async (label, id) => {
    const request = {
      [id]: { selected: '' },
    }

    const errors = await identityNumbersValidator(request)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual(`Enter this person’s ${label}`)
    expect(errors[0].href).toEqual(`#${id}-value-input`)
  })
})
