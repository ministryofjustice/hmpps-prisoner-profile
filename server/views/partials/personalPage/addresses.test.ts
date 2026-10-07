import * as cheerio from 'cheerio'
import nunjucks from 'nunjucks'
import { CorePersonRecordPermission } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { formatAddressDate, formatDate } from '../../../utils/dateHelpers'
import { formatPhoneNumber } from '../../../utils/utils'
import { mockAddresses } from '../../../data/localMockData/addresses'
import { AddressForDisplay } from '../../../services/interfaces/personalPageService/PersonalPage'
import { Result } from '../../../utils/result/result'

const env = nunjucks.configure(['server/views', 'node_modules/govuk-frontend/dist'], { autoescape: true })
env.addFilter('formatAddressDate', formatAddressDate)
env.addFilter('formatDate', formatDate)
env.addFilter('formatPhoneNumber', formatPhoneNumber)

const mockAddress = mockAddresses[0]
const mockHomePhone = mockAddress.phones!.find(phone => phone.type === 'HOME')!
const referenceDataValue = (description: string) => ({ id: description, code: description, description })

const address: AddressForDisplay = {
  ...mockAddress,
  addressId: mockAddress.addressId!,
  addressTypes: mockAddress.addressUsages
    .filter(usage => usage.activeFlag)
    .map(usage => ({
      addressUsageType: {
        id: usage.addressUsage,
        code: usage.addressUsage,
        description: usage.addressUsageDescription,
      },
      active: usage.activeFlag,
    })),
  fromDate: mockAddress.startDate!,
  toDate: '2099-06-16',
  primaryAddress: mockAddress.primary,
  postalAddress: true,
  subBuildingName: mockAddress.flat,
  buildingName: mockAddress.premise,
  thoroughfareName: mockAddress.street,
  dependantLocality: mockAddress.locality,
  postTown: referenceDataValue(mockAddress.town),
  county: referenceDataValue(mockAddress.county),
  country: referenceDataValue(mockAddress.country),
  postCode: mockAddress.postalCode,
  addressPhoneNumbersForDisplay: [
    {
      id: mockHomePhone.phoneId,
      type: mockHomePhone.type,
      typeDescription: 'Home',
      number: mockHomePhone.number,
      extension: '567',
      createDatetime: '2023-07-19T10:00:00',
      updatedOn: '2023-07-20T11:00:00',
    },
  ],
}

const render = (overrides = {}) => {
  const params = {
    prisonerNumber: 'A1234BC',
    addresses: Result.fulfilled({ primaryOrPostal: [address], totalActive: 2 }),
    editEnabled: true,
    editAddressSpecificPhoneNumbersEnabled: true,
    CorePersonRecordPermission,
    prisonerPermissions: {},
    isGranted: (permission: CorePersonRecordPermission) => permission === CorePersonRecordPermission.edit_address,
    ...overrides,
  }
  return cheerio.load(env.render('partials/personalPage/addresses.njk', params))
}

describe('Personal page addresses', () => {
  it.each([
    [true, true, 'Primary and postal address'],
    [true, false, 'Primary address'],
    [false, true, 'Postal address'],
  ])('renders the address heading and details (%s, %s)', (primaryAddress, postalAddress, heading) => {
    const $ = render({
      addresses: Result.fulfilled({
        primaryOrPostal: [{ ...address, primaryAddress, postalAddress }],
        totalActive: 2,
      }),
    })

    expect($('.hmpps-address > h2').text()).toBe(heading)
    expect($('.hmpps-address').text()).toContain('7')
    expect($('.hmpps-address').text()).toContain('premises address')
    expect($('.hmpps-address').text()).toContain('street field')
    expect($('details').text()).toContain('Address type')
    expect($('details').text()).toContain('Address dates')
    expect($('details').text()).toContain('From May 2020 to June 2099')
    expect($('details').text()).toContain('comment field goes here.')
    expect($('details').text()).not.toContain('Address phone numbers')
    expect($('.hmpps-address__added-date').text()).toBe('Added on 1 May 2020')
    expect($('[data-qa="all-addresses-link"]').text().trim()).toBe('View all addresses (2)')
    expect($('[data-qa="all-addresses-link"]').attr('href')).toBe('/prisoner/A1234BC/addresses')
  })

  it('shows a list of phone numbers for an address with add and change links', () => {
    const $ = render()
    const phones = $('[data-qa="address-phone-numbers"]')

    expect(phones.find('h2').text()).toBe('Phone numbers')
    expect(phones.text()).toContain('Home')
    expect(phones.text()).toContain(mockHomePhone.number)
    expect(phones.text()).toContain('Extension: 567')
    expect(phones.text()).toContain('Updated on 20 July 2023')
    expect(phones.text()).not.toContain('Updated by')
    expect($('details').text()).not.toContain(mockHomePhone.number)
    expect(phones.find('a').eq(0).text().trim()).toBe('Add a new phone number')
    expect(phones.find('a').eq(0).attr('href')).toBe(
      `/prisoner/A1234BC/addresses/${mockAddress.addressId}/add-address-phone-number`,
    )
    expect(phones.find('a').eq(1).attr('href')).toBe(
      `/prisoner/A1234BC/addresses/${mockAddress.addressId}/change-address-phone-number/${mockHomePhone.phoneId}`,
    )
    expect(phones.find('a').eq(1).text()).toContain('Change')
    expect(phones.find('a').eq(1).find('.govuk-visually-hidden').text()).toContain('Home')
  })

  it('keeps numbers visible but hides edit links without address-edit permission', () => {
    const $ = render({
      isGranted: (permission: CorePersonRecordPermission) =>
        permission === CorePersonRecordPermission.edit_phone_numbers,
    })

    expect($('[data-qa="address-phone-numbers"]').text()).toContain(mockHomePhone.number)
    expect($('.hmpps-address a')).toHaveLength(0)
    expect($('a[href="personal/where-is-address"]')).toHaveLength(0)
  })

  it('hides phone edit links when general profile editing is disabled', () => {
    const $ = render({ editEnabled: false })
    expect($('.hmpps-address a')).toHaveLength(0)
  })

  it.each([
    { description: 'an empty list', phoneNumbers: [] },
    { description: 'an undefined list', phoneNumbers: undefined },
  ])('shows Not entered by itself when phone numbers are $description', ({ phoneNumbers }) => {
    const $ = render({
      addresses: Result.fulfilled({
        primaryOrPostal: [{ ...address, addressPhoneNumbersForDisplay: phoneNumbers }],
        totalActive: 1,
      }),
    })

    const phones = $('[data-qa="address-phone-numbers"]')
    expect(phones.children('p').text()).toBe('Not entered')
    expect(phones.find('.hmpps-address__phone')).toHaveLength(0)
    expect(phones.find('a')).toHaveLength(1)
    expect(phones.text()).not.toContain('Updated on')
  })

  it('orders phone numbers by creation date, not modification date', () => {
    const $ = render({
      addresses: Result.fulfilled({
        primaryOrPostal: [
          {
            ...address,
            addressPhoneNumbersForDisplay: [
              { ...address.addressPhoneNumbersForDisplay[0], updatedOn: '2025-01-01T10:00:00' },
              {
                id: 456,
                type: 'MOB',
                typeDescription: 'Mobile',
                number: '+07123456789',
                createDatetime: '2024-01-01T10:00:00',
                updatedOn: '2024-01-01T10:00:00',
              },
            ],
          },
        ],
        totalActive: 1,
      }),
    })

    const phones = $('[data-qa="address-phone-numbers"] .hmpps-address__phone')
    expect(phones).toHaveLength(2)
    expect(phones.eq(0).text()).toContain('Mobile')
    expect(phones.eq(0).find('.hmpps-address__phone__details p').eq(1).text()).toBe('+07123456789')
    expect(phones.eq(0).text()).toContain('Updated on 1 January 2024')
    expect(phones.eq(0).text()).not.toContain('Extension:')
    expect(phones.eq(1).text()).toContain('Home')
    expect(phones.eq(1).text()).toContain('Updated on 1 January 2025')
  })

  it('shows Comments with Not entered when no comment is saved', () => {
    const $ = render({
      addresses: Result.fulfilled({ primaryOrPostal: [{ ...address, comment: null }], totalActive: 1 }),
    })
    expect($('details').text()).toContain('Comments')
    expect($('details').text()).toContain('Not entered')
  })

  it.each([false, true])('leaves the no-address display unchanged with flag %s', enabled => {
    const $ = render({
      editAddressSpecificPhoneNumbersEnabled: enabled,
      addresses: Result.fulfilled({ primaryOrPostal: [], totalActive: 0 }),
    })

    expect($('a[href="personal/where-is-address"]').text()).toBe('Add a home address')
    expect($('#addresses').text()).toContain('No active primary or postal addresses entered.')
    expect($('[data-qa="address-phone-numbers"]')).toHaveLength(0)
    expect($('[data-qa="all-addresses-link"]')).toHaveLength(0)
  })

  it('retains the legacy display when the feature flag is disabled', () => {
    const $ = render({
      editAddressSpecificPhoneNumbersEnabled: false,
      addresses: Result.fulfilled({ primaryOrPostal: [{ ...address, comment: null }], totalActive: 1 }),
    })

    expect($('.hmpps-address > .govuk-caption-m').text()).toBe('Primary and postal address')
    expect($('details').text()).toContain('Address phone numbers')
    expect($('details').text()).toContain(mockHomePhone.number)
    expect($('details').text()).toContain('Ext: 567')
    expect($('details').text()).toContain('Comments')
    expect($('details').text()).toContain('Not entered')
    expect($('[data-qa="address-phone-numbers"]')).toHaveLength(0)
    expect($('.hmpps-address a')).toHaveLength(0)
  })

  it('retains the API error display', () => {
    const $ = render({ addresses: Result.rejected(new Error('Unavailable')), unavailableApiErrorText: 'Unavailable' })
    expect($('[data-qa="addresses-api-error"]').text()).toContain('Unavailable')
    expect($('[data-qa="address-phone-numbers"]')).toHaveLength(0)
  })
})
