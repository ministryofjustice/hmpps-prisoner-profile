export const profileBannerData = {
  prisonerName: 'Jones, David',
  prisonId: 'A8469DY',
}

export const profileBannerTopLinks = [
  {
    heading: 'Location',
    info: 'C-2-013',
    classes: '',
  },
  {
    heading: 'Category',
    info: 'B',
    classes: '',
  },
  {
    heading: 'CSRA',
    info: 'Standard',
    classes: '',
  },
  {
    heading: 'Incentive level',
    info: 'Standard',
    classes: 'remove-column-gutter-right',
  },
]

export const alerts = [
  {
    label: 'Staff assaulter',
    classes: 'alert-status alert-status--security',
  },
  {
    label: 'Risk to females',
    classes: 'alert-status alert-status--security',
  },
  {
    label: 'Gang member',
    classes: 'alert-status alert-status--security',
  },
  {
    label: 'ACCT open',
    classes: 'alert-status alert-status--self-harm',
  },
]

interface TabLink {
  label: string
  classes: string
  id: string
  href: string
  active: boolean
}

export function tabLinks(prisonerNumber: string): TabLink[] {
  const baseUrl = `/prisoner/${prisonerNumber}`
  return [
    {
      label: 'Overview',
      classes: 'govuk-heading-s',
      id: 'overview',
      href: baseUrl,
      active: false,
    },
    {
      label: 'Personal',
      classes: 'govuk-heading-s',
      id: 'personal',
      href: `${baseUrl}/personal`,
      active: false,
    },
    {
      label: 'Case notes',
      classes: 'govuk-heading-s',
      id: 'case-notes',
      active: false,
      href: '#',
    },
    {
      label: 'Alerts',
      classes: 'govuk-heading-s',
      id: 'alerts',
      active: false,
      href: `${baseUrl}/alerts/active`,
    },
    {
      label: 'Offences',
      classes: 'govuk-heading-s',
      id: 'offences',
      href: `${baseUrl}/offences`,
      active: false,
    },
    {
      label: 'Work and skills',
      classes: 'govuk-heading-s',
      id: 'work-and-skills',
      href: `${baseUrl}/work-and-skills`,
      active: false,
    }
  ]
}
