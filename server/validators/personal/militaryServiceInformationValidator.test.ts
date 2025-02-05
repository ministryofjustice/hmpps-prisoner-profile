import { militaryServiceInformationValidator } from './militaryServiceInformationValidator'

describe('Military Service Information Validator', () => {
  const defaultSuccessBody = {
    militaryBranchCode: 'ARM',
    'startDate-year': '2020',
    'startDate-month': '01',
    enlistmentLocation: 'Location 1',
  }

  it('Valid data', async () => {
    const errors = await militaryServiceInformationValidator(defaultSuccessBody)
    expect(errors.length).toEqual(0)
  })

  it('Service number too long', async () => {
    const body = {
      ...defaultSuccessBody,
      serviceNumber: '1234567890123',
    }
    const errors = await militaryServiceInformationValidator(body)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('Service number must be 12 characters or less')
    expect(errors[0].href).toEqual('#serviceNumber')
  })

  it('Missing military branch code', async () => {
    const body = {
      'startDate-year': '2020',
      'startDate-month': '01',
      enlistmentLocation: 'Location 1',
    }
    const errors = await militaryServiceInformationValidator(body)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('Select a military branch')
    expect(errors[0].href).toEqual('#militaryBranchCode')
  })

  it('Unit number too long', async () => {
    const body = {
      ...defaultSuccessBody,
      unitNumber: 'a'.repeat(21),
    }
    const errors = await militaryServiceInformationValidator(body)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('Unit number must be 20 characters or less')
    expect(errors[0].href).toEqual('#unitNumber')
  })

  it('Missing start date', async () => {
    const body = {
      militaryBranchCode: 'ARM',
      enlistmentLocation: 'Location 1',
    }
    const errors = await militaryServiceInformationValidator(body)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('Enter the date they enlisted in the armed forces')
    expect(errors[0].href).toEqual('#startDate')
  })

  it('Missing start date year', async () => {
    const body = {
      militaryBranchCode: 'ARM',
      'startDate-month': '01',
      enlistmentLocation: 'Location 1',
    }
    const errors = await militaryServiceInformationValidator(body)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('The date they enlisted in the armed forces must include a year')
    expect(errors[0].href).toEqual('#startDate-year')
  })

  it('Missing start date month', async () => {
    const body = {
      militaryBranchCode: 'ARM',
      'startDate-year': '2020',
      enlistmentLocation: 'Location 1',
    }
    const errors = await militaryServiceInformationValidator(body)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('The date they enlisted in the armed forces must include a month')
    expect(errors[0].href).toEqual('#startDate-month')
  })

  it('Invalid start date', async () => {
    const body = {
      militaryBranchCode: 'ARM',
      'startDate-year': '2020',
      'startDate-month': '13',
      enlistmentLocation: 'Location 1',
    }
    const errors = await militaryServiceInformationValidator(body)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('Enter a real date')
    expect(errors[0].href).toEqual('#startDate')
  })

  it('Future start date', async () => {
    const body = {
      militaryBranchCode: 'ARM',
      'startDate-year': '2100',
      'startDate-month': '01',
      enlistmentLocation: 'Location 1',
    }
    const errors = await militaryServiceInformationValidator(body)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('The date they enlisted in the armed forces must be in the past')
    expect(errors[0].href).toEqual('#startDate')
  })

  it('Enlistment location too long', async () => {
    const body = {
      ...defaultSuccessBody,
      enlistmentLocation: 'a'.repeat(41),
    }
    const errors = await militaryServiceInformationValidator(body)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('Enlistment location must be 40 characters or less')
    expect(errors[0].href).toEqual('#enlistmentLocation')
  })

  it('Description too long', async () => {
    const body = {
      ...defaultSuccessBody,
      description: 'a'.repeat(241),
    }
    const errors = await militaryServiceInformationValidator(body)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('Enter your comments using 240 characters or less')
    expect(errors[0].href).toEqual('#description')
  })
})
