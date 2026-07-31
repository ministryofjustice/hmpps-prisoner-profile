import nunjucks from 'nunjucks'
import * as cheerio from 'cheerio'
import { pluralise } from '../../../utils/pluralise'
import {
  propertySummaryDueOutMock,
  propertySummaryEmptyMock,
  propertySummaryMock,
  propertySummaryNoEstablishmentMock,
} from '../../../data/localMockData/prisonerPropertySummaryMock'
import type { PrisonerPropertySummary } from '../../../data/interfaces/prisonerPropertyApi'

const njkEnv = nunjucks.configure([
  'node_modules/govuk-frontend/dist/',
  'node_modules/@ministryofjustice/frontend/',
  'server/views/',
])
njkEnv.addFilter('pluralise', pluralise)

const render = (propertySummary: PrisonerPropertySummary) =>
  cheerio.load(
    njkEnv.render('partials/personalPage/propertySummary.njk', {
      propertySummary,
      prisonerNumber: 'G6123VU',
      propertyUiUrl: 'https://property.example.com',
    }),
  )

describe('Personal page - property summary card', () => {
  it('renders the card under the same heading and anchor as the card it replaces', () => {
    const $ = render(propertySummaryMock)

    expect($('#property').length).toEqual(1)
    expect($('[data-qa=summary-header] h2').text().trim()).toEqual('Property')
  })

  describe('the three designed states', () => {
    it('renders property held here, more due in, and one overdue for disposal', () => {
      const $ = render(propertySummaryMock)

      expect($('[data-qa=property-container-count]').text().trim()).toEqual(
        '2 property containers in Isle of Wight (HMP)',
      )
      expect($('[data-qa=due-for-transfer-in]').text().trim()).toEqual('Due for transfer in: 3')
      expect($('[data-qa=due-for-transfer-out]').text().trim()).toEqual('Due for transfer out: 0')
      expect($('[data-qa=overdue-for-disposal]').text()).toContain('1 overdue for disposal')
      expect($('[data-qa=overdue-for-return]').length).toEqual(0)
      expect($('[data-qa=property-containers-link]').attr('href')).toEqual(
        'https://property.example.com/prisoner/G6123VU',
      )
    })

    it('renders property due out, overdue for both disposal and return', () => {
      const $ = render(propertySummaryDueOutMock)

      expect($('[data-qa=property-container-count]').text().trim()).toEqual(
        '3 property containers in Isle of Wight (HMP)',
      )
      expect($('[data-qa=due-for-transfer-in]').text().trim()).toEqual('Due for transfer in: 0')
      expect($('[data-qa=due-for-transfer-out]').text().trim()).toEqual('Due for transfer out: 5')
      expect($('[data-qa=overdue-for-disposal]').text()).toContain('1 overdue for disposal')
      expect($('[data-qa=overdue-for-return]').text()).toContain('1 overdue for return')
    })

    it('renders no property, and links to the history instead of the containers', () => {
      const $ = render(propertySummaryEmptyMock)

      expect($('[data-qa=property-container-count]').text().trim()).toEqual(
        '0 property containers in Isle of Wight (HMP)',
      )
      expect($('[data-qa=overdue-for-disposal]').length).toEqual(0)
      expect($('[data-qa=overdue-for-return]').length).toEqual(0)
      expect($('[data-qa=property-containers-link]').length).toEqual(0)
      expect($('[data-qa=property-history-link]').attr('href')).toEqual(
        'https://property.example.com/prisoner/G6123VU/history',
      )
    })
  })

  it('drops the establishment when the person is released or in transit', () => {
    const $ = render(propertySummaryNoEstablishmentMock)

    expect($('[data-qa=property-container-count]').text().trim()).toEqual('0 property containers')
  })

  it('links to the containers when the only property is held at another establishment', () => {
    const $ = render(propertySummaryNoEstablishmentMock)

    expect($('[data-qa=property-containers-link]').length).toEqual(1)
    expect($('[data-qa=property-history-link]').length).toEqual(0)
  })

  it('uses the singular form for a single container', () => {
    const $ = render({ ...propertySummaryMock, heldInCurrentEstablishment: 1 })

    expect($('[data-qa=property-container-count]').text().trim()).toEqual('1 property container in Isle of Wight (HMP)')
  })
})
