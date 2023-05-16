import { Role } from '../data/enums/role'

// eslint-disable-next-line import/prefer-default-export
export const canViewOrAddCaseNotes = (roles: string[], activeCaseLoadId: string, prisonId: string) => {
  return (
    (roles?.some(role => role === Role.InactiveBookings) && ['OUT', 'TRN'].includes(prisonId)) ||
    activeCaseLoadId === prisonId
  )
}
