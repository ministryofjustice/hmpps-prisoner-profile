import type Component from '@ministryofjustice/hmpps-connect-dps-components/dist/types/Component'
import type Service from '@ministryofjustice/hmpps-connect-dps-components/dist/types/Service'
import CaseLoad from '../../interfaces/prisonApi/CaseLoad'

export const componentsHeaderMock: Component = {
  html: '',
  css: [],
  javascript: [],
}

export const componentsFooterMock: Component = {
  html: '<footer class="connect-dps-common-footer govuk-!-display-none-print" role="contentinfo"></footer>',
  css: [],
  javascript: [],
}

export const componentsCaseLoadMock: CaseLoad = {
  caseLoadId: 'MDI',
  currentlyActive: true,
  description: '',
  type: '',
  caseloadFunction: '',
}

export const componentsServicesMock: Service[] = [
  {
    id: 'alerts',
    heading: '',
    description: '',
    href: '',
    navEnabled: false,
  },
  {
    id: 'csipUI',
    heading: '',
    description: '',
    href: '',
    navEnabled: true,
  },
]
