import { addressValidator } from './addressValidator'

const submittedAddress = {
  houseOrBuildingName: 'house or building name',
  houseNumber: '123',
  addressLine1: 'address line 1',
  addressLine2: 'address line 2',
  townOrCity: 'TOWN1',
  county: 'COUNTY1',
  postcode: 'sW1h 9aJ',
  country: 'COUNTRY1',
}

describe('Address Validator', () => {
  it('Valid data', async () => {
    const errors = await addressValidator(submittedAddress)
    expect(errors.length).toEqual(0)
  })

  it('Field houseOrBuildingName exceeds 50 chars', async () => {
    const body = {
      ...submittedAddress,
      houseOrBuildingName: 'a'.repeat(51),
    }

    const errors = await addressValidator(body)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('House or building name must be 50 characters or less')
    expect(errors[0].href).toEqual('#house-or-building-name')
  })

  it('Field houseNumber exceeds 4 chars', async () => {
    const body = {
      ...submittedAddress,
      houseNumber: '1'.repeat(5),
    }

    const errors = await addressValidator(body)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('House number must be 4 characters or less')
    expect(errors[0].href).toEqual('#house-number')
  })

  it('Field addressLine1 exceeds 60 chars', async () => {
    const body = {
      ...submittedAddress,
      addressLine1: 'a'.repeat(61),
    }

    const errors = await addressValidator(body)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('Address line 1 must be 60 characters or less')
    expect(errors[0].href).toEqual('#address-line-1')
  })

  it('Field addressLine2 exceeds 35 chars', async () => {
    const body = {
      ...submittedAddress,
      addressLine2: 'a'.repeat(36),
    }

    const errors = await addressValidator(body)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('Address line 2 must be 35 characters or less')
    expect(errors[0].href).toEqual('#address-line-2')
  })

  it('Field postcode exceeds 8 chars', async () => {
    const body = {
      ...submittedAddress,
      postcode: 'a'.repeat(9),
    }

    const errors = await addressValidator(body)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('Postcode must be 8 characters or less')
    expect(errors[0].href).toEqual('#postcode')
  })

  it('Presence of townOrCityError fails validation', async () => {
    const body = {
      ...submittedAddress,
      townOrCityError: 'error',
    }

    const errors = await addressValidator(body)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('Enter a valid town or city')
    expect(errors[0].href).toEqual('#town-or-city')
  })

  it('Presence of countyError fails validation', async () => {
    const body = {
      ...submittedAddress,
      countyError: 'error',
    }

    const errors = await addressValidator(body)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('Enter a valid county')
    expect(errors[0].href).toEqual('#county')
  })

  it('Country is required', async () => {
    const body = {
      ...submittedAddress,
      country: undefined as string,
    }

    const errors = await addressValidator(body)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('Enter a country')
    expect(errors[0].href).toEqual('#country')
  })

  it('Presence of countryError fails validation', async () => {
    const body = {
      ...submittedAddress,
      countryError: 'error',
    }

    const errors = await addressValidator(body)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('Enter a valid country')
    expect(errors[0].href).toEqual('#country')
  })
})
