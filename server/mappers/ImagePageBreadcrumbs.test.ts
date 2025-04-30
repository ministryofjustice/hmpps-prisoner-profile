import { imagePageBreadcrumbs, Referer } from './imagePageBreadcrumbs'

describe('imagePageBreadcrumbs', () => {
  const prisonerName = 'Smith, John'
  const prisonerNumber = 'A1234BC'

  it('should return basic breadcrumbs when no referer is provided', () => {
    const result = imagePageBreadcrumbs(prisonerName, prisonerNumber, null)

    expect(result).toEqual([
      {
        text: 'Digital Prison Services',
        href: '/',
      },
      {
        text: prisonerName,
        href: `/prisoner/${prisonerNumber}`,
      },
    ])
  })

  it('should return basic breadcrumbs when referer is an empty string', () => {
    const result = imagePageBreadcrumbs(prisonerName, prisonerNumber, '')

    expect(result).toEqual([
      {
        text: 'Digital Prison Services',
        href: '/',
      },
      {
        text: prisonerName,
        href: `/prisoner/${prisonerNumber}`,
      },
    ])
  })

  it('should return basic breadcrumbs when referer is invalid', () => {
    const result = imagePageBreadcrumbs(prisonerName, prisonerNumber, 'invalid-referer')

    expect(result).toEqual([
      {
        text: 'Digital Prison Services',
        href: '/',
      },
      {
        text: prisonerName,
        href: `/prisoner/${prisonerNumber}`,
      },
    ])
  })

  it('should add personal page breadcrumb when referer is personal', () => {
    const result = imagePageBreadcrumbs(prisonerName, prisonerNumber, Referer.Personal)

    expect(result).toEqual([
      {
        text: 'Digital Prison Services',
        href: '/',
      },
      {
        text: prisonerName,
        href: `/prisoner/${prisonerNumber}`,
      },
      {
        text: 'Personal',
        href: `/prisoner/${prisonerNumber}/${Referer.Personal}`,
      },
    ])
  })

  it('should add active alerts breadcrumb when referer is alerts/active', () => {
    const result = imagePageBreadcrumbs(prisonerName, prisonerNumber, Referer.AlertsActive)

    expect(result).toEqual([
      {
        text: 'Digital Prison Services',
        href: '/',
      },
      {
        text: prisonerName,
        href: `/prisoner/${prisonerNumber}`,
      },
      {
        text: 'Alerts',
        href: `/prisoner/${prisonerNumber}/${Referer.AlertsActive}`,
      },
    ])
  })

  it('should add inactive alerts breadcrumb when referer is alerts/inactive', () => {
    const result = imagePageBreadcrumbs(prisonerName, prisonerNumber, Referer.AlertsInactive)

    expect(result).toEqual([
      {
        text: 'Digital Prison Services',
        href: '/',
      },
      {
        text: prisonerName,
        href: `/prisoner/${prisonerNumber}`,
      },
      {
        text: 'Alerts',
        href: `/prisoner/${prisonerNumber}/${Referer.AlertsInactive}`,
      },
    ])
  })

  it('should add case notes breadcrumb when referer is case-notes', () => {
    const result = imagePageBreadcrumbs(prisonerName, prisonerNumber, Referer.CaseNotes)

    expect(result).toEqual([
      {
        text: 'Digital Prison Services',
        href: '/',
      },
      {
        text: prisonerName,
        href: `/prisoner/${prisonerNumber}`,
      },
      {
        text: 'Case notes',
        href: `/prisoner/${prisonerNumber}/${Referer.CaseNotes}`,
      },
    ])
  })

  it('should add work and skills breadcrumb when referer is work-and-skills', () => {
    const result = imagePageBreadcrumbs(prisonerName, prisonerNumber, Referer.WorkAndSkills)

    expect(result).toEqual([
      {
        text: 'Digital Prison Services',
        href: '/',
      },
      {
        text: prisonerName,
        href: `/prisoner/${prisonerNumber}`,
      },
      {
        text: 'Work and skills',
        href: `/prisoner/${prisonerNumber}/${Referer.WorkAndSkills}`,
      },
    ])
  })

  it('should add offences breadcrumb when referer is offences', () => {
    const result = imagePageBreadcrumbs(prisonerName, prisonerNumber, Referer.Offences)

    expect(result).toEqual([
      {
        text: 'Digital Prison Services',
        href: '/',
      },
      {
        text: prisonerName,
        href: `/prisoner/${prisonerNumber}`,
      },
      {
        text: 'Offences',
        href: `/prisoner/${prisonerNumber}/${Referer.Offences}`,
      },
    ])
  })
})
