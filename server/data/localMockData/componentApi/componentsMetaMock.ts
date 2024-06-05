import type Component from '@ministryofjustice/hmpps-connect-dps-components/dist/types/Component'
import type HeaderFooterMeta from '@ministryofjustice/hmpps-connect-dps-components/dist/types/HeaderFooterMeta'

export const componentsMetaMock: HeaderFooterMeta = {
  activeCaseLoad: {
    caseLoadId: 'MDI',
    currentlyActive: true,
    description: '',
    type: '',
    caseloadFunction: '',
  },
  caseLoads: [
    {
      caseLoadId: 'MDI',
      currentlyActive: true,
      description: '',
      type: '',
      caseloadFunction: '',
    },
  ],
  services: [
    {
      id: 'alerts',
      heading: '',
      description: '',
      href: '',
      navEnabled: false,
    },
  ],
}

export const componentsMetaNoServicesMock: HeaderFooterMeta = {
  activeCaseLoad: {
    caseLoadId: 'MDI',
    currentlyActive: true,
    description: '',
    type: '',
    caseloadFunction: '',
  },
  caseLoads: [
    {
      caseLoadId: 'MDI',
      currentlyActive: true,
      description: '',
      type: '',
      caseloadFunction: '',
    },
  ],
  services: [],
}

export const componentsMock: { header: Component; footer: Component; meta: HeaderFooterMeta } = {
  header: {
    html: '',
    css: [],
    javascript: [],
  },
  footer: {
    html: '',
    css: [],
    javascript: [],
  },
  meta: componentsMetaMock,
}

export const componentsNoServicesMock: { header: Component; footer: Component; meta: HeaderFooterMeta } = {
  header: {
    html: '',
    css: [],
    javascript: [],
  },
  footer: {
    html: '',
    css: [],
    javascript: [],
  },
  meta: componentsMetaNoServicesMock,
}
