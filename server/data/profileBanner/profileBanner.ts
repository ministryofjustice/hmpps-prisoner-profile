import { CaseNotesPermission, isGranted, PrisonerPermissions } from '@ministryofjustice/hmpps-prison-permissions-lib'

export interface TabLink {
  label: string
  classes: string
  id: string
  href: string
  active: boolean
}

export function tabLinks({
  prisonerNumber,
  prisonerPermissions,
  isHighProfilePrisonerOutsideCaseloads, // TODO: remove once folded into permissions library
}: {
  prisonerNumber: string
  prisonerPermissions?: PrisonerPermissions
  isHighProfilePrisonerOutsideCaseloads: boolean
}): TabLink[] {
  const baseUrl = `/prisoner/${prisonerNumber}`
  const links = [
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
    isGranted(CaseNotesPermission.read, prisonerPermissions)
      ? {
          label: 'Case notes',
          classes: 'govuk-heading-s',
          id: 'case-notes',
          active: false,
          href: `${baseUrl}/case-notes`,
        }
      : null,
    {
      label: 'Alerts',
      classes: 'govuk-heading-s',
      id: 'alerts',
      active: false,
      href: `${baseUrl}/alerts/active`,
    },
    isHighProfilePrisonerOutsideCaseloads
      ? null
      : {
          label: 'Offences',
          classes: 'govuk-heading-s',
          id: 'offences',
          href: `${baseUrl}/offences`,
          active: false,
        },
    isHighProfilePrisonerOutsideCaseloads
      ? null
      : {
          label: 'Work and skills',
          classes: 'govuk-heading-s',
          id: 'work-and-skills',
          href: `${baseUrl}/work-and-skills`,
          active: false,
        },
  ]
  return links.filter(Boolean)
}
