import * as cheerio from 'cheerio'
import nunjucks from 'nunjucks'
import { CorePersonRecordPermission } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { formatAddressDate, formatDate } from '../../../utils/dateHelpers'
import { addressToLines, apostrophe, formatPhoneNumber, prependBaseUrl } from '../../../utils/utils'
import { AddressForDisplay } from '../../../services/interfaces/personalPageService/PersonalPage'

const env = nunjucks.configure(['server/views', 'node_modules/govuk-frontend/dist'], { autoescape: true })
env.addFilter('addressToLines', addressToLines)
env.addFilter('formatAddressDate', formatAddressDate)
env.addFilter('formatDate', formatDate)
env.addFilter('formatPhoneNumber', formatPhoneNumber)
env.addFilter('apostrophe', apostrophe)
env.addFilter('prependBaseUrl', prependBaseUrl)
env.addFilter('removeNullish', (values: unknown[]) => values.filter(value => value != null))
env.addFilter('assetMap', value => value)

const address = {
  addressId: 5622837,
  noFixedAbode: false,
  subBuildingName: 'Flat 2',
  buildingName: 'Building',
  buildingNumber: '1',
  thoroughfareName: 'Street',
  dependantLocality: 'Locality',
  postTown: { description: 'Town' },
  county: { description: 'County' },
  postCode: 'AB1 1AB',
  country: { description: 'England' },
  fromDate: '2024-01-01',
  addressTypes: [{ addressUsageType: { code: 'HOME', description: 'Home' }, active: true }],
  comment: 'Comment',
  addressPhoneNumbersForDisplay: [
    {
      id: 123,
      type: 'HOME',
      typeDescription: 'Home',
      number: '01234567890',
      extension: '123',
      createDatetime: '2024-01-01T10:00:00',
      updatedOn: '2024-01-02T11:00:00',
    },
    {
      id: 124,
      type: 'VISIT',
      typeDescription: 'Agency visit line',
      number: '02012345678',
      createDatetime: '2024-02-01T10:00:00',
      updatedOn: '2024-02-01T10:00:00',
    },
  ],
} as AddressForDisplay

const addressUrl = '/prisoner/G6123VU/addresses/5622837'
const render = (overrides = {}) => {
  const params = {
    primaryAddress: address,
    otherAddresses: [] as AddressForDisplay[],
    prisonerNumber: 'G6123VU',
    prisonerName: { firstLast: 'John Saunders' },
    editEnabled: true,
    editAddressSpecificPhoneNumbersEnabled: true,
    CorePersonRecordPermission,
    isGranted: () => true,
    appInsightsWebAnalyticsEnabled: () => false,
    ...overrides,
  }
  const $ = cheerio.load(env.render('pages/addresses/addresses.njk', params))
  return cheerio.load($('.address-cards').html() ?? '')
}

describe('Addresses page', () => {
  it.each([false, true])('formats address phones only when the flag is disabled (%s)', enabled => {
    const $ = render({ editEnabled: false, editAddressSpecificPhoneNumbersEnabled: enabled })
    const rows = $('.govuk-summary-list__row')

    expect(rows.eq(4).find('dt').text().trim()).toBe('Phone numbers')
    expect(
      rows
        .eq(enabled ? 5 : 4)
        .find('.govuk-summary-list__value')
        .text(),
    ).toContain(enabled ? '02012345678' : '02012 345678')
    expect($('a')).toHaveLength(0)
  })

  it('renders address details and latest-first phone actions', () => {
    const $ = render()
    const rows = $('.govuk-summary-list__row')

    expect(
      $('dt')
        .map((_, element) => $(element).text().trim())
        .get(),
    ).toEqual(['Address', 'Address type', 'Address dates', 'Comments', 'Phone numbers', '', ''])
    expect(rows.eq(0).text()).toContain('Flat 2, Building, 1 Street')
    expect(rows.eq(0).text()).toContain('Locality')
    expect($('[data-qa="address-added-on"]').text()).toBe('Added on 1 January 2024')
    expect(rows.eq(1).find('dd').text().trim()).toBe('Home')
    expect(rows.eq(2).find('dd').text().trim()).toBe('From January 2024')
    expect(rows.eq(3).find('dd').text().trim()).toBe('Comment')
    expect(rows.eq(4).find('.govuk-summary-list__value').text().trim()).toBe('')
    expect(rows.eq(4).find('a').attr('href')).toBe(`${addressUrl}/add-address-phone-number`)
    expect(rows.eq(4).find('a').text()).toContain('Add a phone number')
    expect(rows.eq(5).find('.govuk-summary-list__value p').first().text()).toBe('Agency visit line')
    expect(rows.eq(5).find('[class~="govuk-!-font-weight-bold"]')).toHaveLength(0)
    expect(rows.eq(5).text()).toContain('02012345678')
    expect(rows.eq(5).find('[data-qa="phone-updated-on"]').text()).toBe('Updated on 1 February 2024')
    expect(rows.eq(5).find('a').attr('href')).toBe(`${addressUrl}/change-address-phone-number/124`)
    expect(rows.eq(5).find('.govuk-visually-hidden').text().trim()).toBe('Agency visit line number 02012345678')
    expect(rows.eq(6).text()).toContain('Home')
    expect(rows.eq(6).text()).toContain('01234567890')
    expect(rows.eq(6).text()).toContain('Extension: 123')
    expect(rows.eq(6).find('[data-qa="phone-updated-on"]').text()).toBe('Updated on 2 January 2024')
    expect(rows.eq(6).find('a').attr('href')).toBe(`${addressUrl}/change-address-phone-number/123`)
    expect(rows.first().hasClass('govuk-summary-list__row--no-actions')).toBe(true)
  })

  it('preserves the source order when phone creation dates are the same', () => {
    const $ = render({
      primaryAddress: {
        ...address,
        addressPhoneNumbersForDisplay: address.addressPhoneNumbersForDisplay.map(phone => ({
          ...phone,
          createDatetime: '',
        })),
      },
    })

    expect(
      $('.govuk-summary-list__row')
        .slice(5)
        .find('.govuk-summary-list__value p:first-child')
        .map((_, element) => $(element).text())
        .get(),
    ).toEqual(['Home', 'Agency visit line'])
  })

  it('always shows empty phone and comment states', () => {
    const $ = render({
      primaryAddress: { ...address, comment: undefined, addressPhoneNumbersForDisplay: [] },
      editEnabled: false,
    })

    expect($('dt')).toHaveLength(5)
    expect($('.govuk-summary-list__value').eq(3).text().trim()).toBe('Not entered')
    expect($('.govuk-summary-list__value').eq(4).text().trim()).toBe('Not entered')
    expect($('a')).toHaveLength(0)
  })

  it('renders no fixed address without address lines', () => {
    const $ = render({ primaryAddress: { ...address, noFixedAbode: true } })

    expect($('.govuk-summary-list__value').first().text()).toContain('No fixed address')
    expect($('.govuk-summary-list__value').first().text()).not.toContain('Building')
  })

  it('returns no rows when the address is missing', () => {
    expect(render({ primaryAddress: null })('.govuk-summary-list__row')).toHaveLength(0)
  })
})
