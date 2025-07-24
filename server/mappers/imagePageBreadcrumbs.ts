export enum Referer {
  Personal = 'personal',
  AlertsActive = 'alerts/active',
  AlertsInactive = 'alerts/inactive',
  CaseNotes = 'case-notes',
  WorkAndSkills = 'work-and-skills',
  Offences = 'offences',
}

const refererTitles: Record<Referer, string> = {
  [Referer.Personal]: 'Personal',
  [Referer.AlertsActive]: 'Alerts',
  [Referer.AlertsInactive]: 'Alerts',
  [Referer.CaseNotes]: 'Case notes',
  [Referer.WorkAndSkills]: 'Work and skills',
  [Referer.Offences]: 'Offences',
}

export const imagePageBreadcrumbs = (
  prisonerName: string,
  prisonerNumber: string,
  referer: string,
): { text: string; href: string }[] => {
  const breadcrumbs = [
    {
      text: 'Digital Prison Services',
      href: '/',
    },
    {
      text: prisonerName,
      href: `/prisoner/${prisonerNumber}`,
    },
  ]
  if (referer && refererTitles[referer as Referer]) {
    breadcrumbs.push({
      text: refererTitles[referer as Referer],
      href: `/prisoner/${prisonerNumber}/${referer}`,
    })
  }
  return breadcrumbs
}
