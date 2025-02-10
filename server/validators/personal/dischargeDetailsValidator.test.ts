import { dischargeDetailsValidator } from './dischargeDetailsValidator'

describe('Discharge Details Validator', () => {
  it('Valid data', async () => {
    const body = {
      militaryDischargeCode: 'CM',
      'endDate-year': '2020',
      'endDate-month': '01',
      dischargeLocation: 'Location 1',
    }
    const errors = await dischargeDetailsValidator(body)
    expect(errors.length).toEqual(0)
  })

  it('Missing end date year', async () => {
    const body = {
      militaryBranchCode: 'ARM',
      'endDate-month': '01',
      dischargeLocation: 'Location 1',
    }
    const errors = await dischargeDetailsValidator(body)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('The date they left the armed forces must include a year')
    expect(errors[0].href).toEqual('#endDate-year')
  })

  it('Missing end date month', async () => {
    const body = {
      militaryBranchCode: 'ARM',
      'endDate-year': '2020',
      dischargeLocation: 'Location 1',
    }
    const errors = await dischargeDetailsValidator(body)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('The date they left the armed forces must include a month')
    expect(errors[0].href).toEqual('#endDate-month')
  })

  it('Invalid end date', async () => {
    const body = {
      militaryBranchCode: 'ARM',
      'endDate-year': '2020',
      'endDate-month': '13',
      dischargeLocation: 'Location 1',
    }
    const errors = await dischargeDetailsValidator(body)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('Enter a real date')
    expect(errors[0].href).toEqual('#endDate')
  })

  it('Future end date', async () => {
    const body = {
      militaryBranchCode: 'ARM',
      'endDate-year': '2100',
      'endDate-month': '01',
      dischargeLocation: 'Location 1',
    }
    const errors = await dischargeDetailsValidator(body)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('The date they left the armed forces must be in the past')
    expect(errors[0].href).toEqual('#endDate')
  })

  it('Discharge location too long', async () => {
    const body = {
      dischargeLocation: 'a'.repeat(41),
    }
    const errors = await dischargeDetailsValidator(body)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('Discharge location must be 40 characters or less')
    expect(errors[0].href).toEqual('#dischargeLocation')
  })
})
