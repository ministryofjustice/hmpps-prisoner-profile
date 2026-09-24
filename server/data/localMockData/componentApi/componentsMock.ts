import type Component from '@ministryofjustice/hmpps-connect-dps-components/dist/types/Component'
import type Service from '@ministryofjustice/hmpps-connect-dps-components/dist/types/Service'
import type CaseLoad from '../../interfaces/prisonApi/CaseLoad'

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
  {
    id: 'my-key-worker-allocations',
    heading: '',
    description: '',
    href: '',
    navEnabled: true,
  },
  {
    id: 'external-movements',
    heading: 'External movements',
    description: 'Add a temporary absence',
    href: 'http://localhost:3001/externalMovements',
    navEnabled: true,
  },
  {
    id: 'x-ray-body-scans',
    heading: 'X-ray body scans',
    description: 'X-ray body scans API',
    href: 'http://localhost:3001/xRayBodyScansApi',
    navEnabled: false,
  },
]
