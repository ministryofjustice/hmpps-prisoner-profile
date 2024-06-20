import PermissionsService from './permissionsService'
import { userServiceMock } from '../../tests/mocks/userServiceMock'
import UserService from './userService'
import { prisonUserMock } from '../data/localMockData/user'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { HmppsStatusCode } from '../data/enums/hmppsStatusCode'
import CaseLoad from '../data/interfaces/prisonApi/CaseLoad'
import { Role } from '../data/enums/role'

describe('permissionsService', () => {
  let service: PermissionsService
  const userService = userServiceMock() as UserService

  beforeEach(() => {
    service = new PermissionsService(userService)
  })

  describe('getOverviewPermissions', () => {
    describe('accessCode', () => {
      it('should return NOT_IN_CASELOAD code if prisoner is not in caseload', async () => {
        const user = {
          ...prisonUserMock,
          activeCaseLoadId: 'LEI',
          caseLoads: [{ caseLoadId: 'LEI', currentlyActive: true } as CaseLoad],
        }
        const prisoner = { ...PrisonerMockDataA, prisonId: 'MDI' }

        const permissions = await service.getOverviewPermissions(user, prisoner)

        expect(permissions).toEqual({
          accessCode: HmppsStatusCode.NOT_IN_CASELOAD,
        })
      })

      describe('when prisoner is restrictedPatient', () => {
        it('should return RESTRICTED_PATIENT code generally', async () => {
          const user = prisonUserMock
          const prisoner = { ...PrisonerMockDataA, restrictedPatient: true }

          const permissions = await service.getOverviewPermissions(user, prisoner)

          expect(permissions).toEqual({
            accessCode: HmppsStatusCode.RESTRICTED_PATIENT,
          })
        })

        it('should return OK if pomUser and prisoner is in case load', async () => {
          const user = { ...prisonUserMock, userRoles: [Role.PomUser] }
          const prisoner = { ...PrisonerMockDataA, restrictedPatient: true }

          const permissions = await service.getOverviewPermissions(user, prisoner)

          expect(permissions).toEqual({
            accessCode: HmppsStatusCode.RESTRICTED_PATIENT,
          })
        })

        it('should return RESTRICTED_PATIENT if pomUser and prisoner NOT in case load', async () => {
          const user = { ...prisonUserMock, userRoles: [Role.PomUser] }
          const prisoner = { ...PrisonerMockDataA, restrictedPatient: true, prisonId: 'MDI' }

          const permissions = await service.getOverviewPermissions(user, prisoner)

          expect(permissions).toEqual({
            accessCode: HmppsStatusCode.RESTRICTED_PATIENT,
          })
        })

        it('should return OK if pom user and inactive booking user', async () => {
          const user = { ...prisonUserMock, userRoles: [Role.InactiveBookings] }
          const prisoner = { ...PrisonerMockDataA, restrictedPatient: true, prisonId: 'MDI' }

          const permissions = await service.getOverviewPermissions(user, prisoner)

          expect(permissions.accessCode).toEqual(HmppsStatusCode.OK)
        })
      })

      describe('when prisoner is out', () => {
        it('should return PRISONER_IS_RELEASED code if prisoner is out and user is not inactiveBookingsUser', async () => {
          const user = prisonUserMock
          const prisoner = { ...PrisonerMockDataA, prisonId: 'OUT' }

          const permissions = await service.getOverviewPermissions(user, prisoner)

          expect(permissions).toEqual({
            accessCode: HmppsStatusCode.PRISONER_IS_RELEASED,
          })
        })

        it('should return OK code if prisoner is out and user is inactiveBookingsUser', async () => {
          const user = { ...prisonUserMock, userRoles: [Role.InactiveBookings] }
          const prisoner = { ...PrisonerMockDataA, prisonId: 'OUT' }

          const permissions = await service.getOverviewPermissions(user, prisoner)

          expect(permissions.accessCode).toEqual(HmppsStatusCode.OK)
        })

        it('should return PRISONER_IS_TRANSFERRING code if prisoner is trn and user is not global search or inactive bookings user', async () => {
          const user = prisonUserMock
          const prisoner = { ...PrisonerMockDataA, prisonId: 'TRN' }

          const permissions = await service.getOverviewPermissions(user, prisoner)

          expect(permissions).toEqual({
            accessCode: HmppsStatusCode.PRISONER_IS_TRANSFERRING,
          })
        })

        it('should return OK code if prisoner is trn and user is global search user', async () => {
          const user = { ...prisonUserMock, userRoles: [Role.GlobalSearch] }
          const prisoner = { ...PrisonerMockDataA, prisonId: 'TRN' }

          const permissions = await service.getOverviewPermissions(user, prisoner)

          expect(permissions.accessCode).toEqual(HmppsStatusCode.OK)
        })

        it('should return OK code if prisoner is trn and user is inactive bookings user', async () => {
          const user = { ...prisonUserMock, userRoles: [Role.InactiveBookings] }
          const prisoner = { ...PrisonerMockDataA, prisonId: 'TRN' }

          const permissions = await service.getOverviewPermissions(user, prisoner)

          expect(permissions.accessCode).toEqual(HmppsStatusCode.OK)
        })
      })
    })

    describe('courtCases', () => {
      it('should return view true if user has ReleaseDatesCalculator role', async () => {
        const user = { ...prisonUserMock, userRoles: [Role.ReleaseDatesCalculator] }

        const permissions = await service.getOverviewPermissions(user, PrisonerMockDataA)

        expect(permissions.courtCases).toEqual({
          view: true,
          edit: false,
        })
      })

      it('should return edit true if user has AdjustmentsMaintainer role', async () => {
        const user = { ...prisonUserMock, userRoles: [Role.AdjustmentsMaintainer] }

        const permissions = await service.getOverviewPermissions(user, PrisonerMockDataA)

        expect(permissions.courtCases).toEqual({
          view: false,
          edit: true,
        })
      })
    })

    describe('money', () => {
      it('should return view true if prisoner is in case load', async () => {
        const permissions = await service.getOverviewPermissions(prisonUserMock, PrisonerMockDataA)

        expect(permissions.money).toEqual({
          view: true,
        })
      })

      it('should return view false if prisoner is not in case load', async () => {
        const user = { ...prisonUserMock, userRoles: [Role.GlobalSearch] }
        const prisoner = { ...PrisonerMockDataA, prisonId: 'LEI' }

        const permissions = await service.getOverviewPermissions(user, prisoner)

        expect(permissions.money).toEqual({
          view: false,
        })
      })
    })

    describe('adjudications', () => {
      it('should return view true if prisoner is in case load', async () => {
        const permissions = await service.getOverviewPermissions(prisonUserMock, PrisonerMockDataA)

        expect(permissions.adjudications).toEqual({
          view: true,
        })
      })

      it('should return view true if user has PomUser role', async () => {
        const user = { ...prisonUserMock, userRoles: [Role.GlobalSearch, Role.PomUser] }
        const prisoner = { ...PrisonerMockDataA, prisonId: 'LEI' }

        const permissions = await service.getOverviewPermissions(user, prisoner)

        expect(permissions.adjudications).toEqual({
          view: true,
        })
      })

      it('should return view true if user has ReceptionUser role', async () => {
        const user = { ...prisonUserMock, userRoles: [Role.GlobalSearch, Role.ReceptionUser] }
        const prisoner = { ...PrisonerMockDataA, prisonId: 'LEI' }

        const permissions = await service.getOverviewPermissions(user, prisoner)

        expect(permissions.adjudications).toEqual({
          view: true,
        })
      })
    })

    describe('visits', () => {
      it('should return view true if prisoner is in case load', async () => {
        const permissions = await service.getOverviewPermissions(prisonUserMock, PrisonerMockDataA)

        expect(permissions.visits).toEqual({
          view: true,
        })
      })

      it('should return view true if user has PomUser role', async () => {
        const user = { ...prisonUserMock, userRoles: [Role.GlobalSearch, Role.PomUser] }
        const prisoner = { ...PrisonerMockDataA, prisonId: 'LEI' }

        const permissions = await service.getOverviewPermissions(user, prisoner)

        expect(permissions.visits).toEqual({
          view: true,
        })
      })

      it('should return view true if user has ReceptionUser role', async () => {
        const user = { ...prisonUserMock, userRoles: [Role.GlobalSearch, Role.ReceptionUser] }
        const prisoner = { ...PrisonerMockDataA, prisonId: 'LEI' }

        const permissions = await service.getOverviewPermissions(user, prisoner)

        expect(permissions.visits).toEqual({
          view: true,
        })
      })
    })

    describe('incentives', () => {
      it('should return view true if prisoner is in case load', async () => {
        const permissions = await service.getOverviewPermissions(prisonUserMock, PrisonerMockDataA)

        expect(permissions.incentives).toEqual({
          view: true,
        })
      })

      it('should return view true if user has GlobalSearch role', async () => {
        const user = { ...prisonUserMock, userRoles: [Role.GlobalSearch] }
        const prisoner = { ...PrisonerMockDataA, prisonId: 'LEI' }

        const permissions = await service.getOverviewPermissions(user, prisoner)

        expect(permissions.incentives).toEqual({
          view: true,
        })
      })
    })

    describe('category', () => {
      it('should return edit false if user doesnt have appropriate role', async () => {
        const permissions = await service.getOverviewPermissions(prisonUserMock, PrisonerMockDataA)

        expect(permissions.category).toEqual({
          view: false,
          edit: false,
        })
      })

      it.each([
        Role.CreateRecategorisation,
        Role.ApproveCategorisation,
        Role.CreateRecategorisation,
        Role.CategorisationSecurity,
      ])('should return edit true if user has %s role', async role => {
        const user = { ...prisonUserMock, userRoles: [role] }

        const permissions = await service.getOverviewPermissions(user, PrisonerMockDataA)

        expect(permissions.category).toEqual({
          view: false,
          edit: true,
        })
      })
    })

    describe('calculateReleaseDates', () => {
      it('should return edit false if user doesnt have appropriate role', async () => {
        const permissions = await service.getOverviewPermissions(prisonUserMock, PrisonerMockDataA)

        expect(permissions.category).toEqual({
          view: false,
          edit: false,
        })
      })

      it('should return edit true if user has ReleaseDatesCalculator role', async () => {
        const user = { ...prisonUserMock, userRoles: [Role.ReleaseDatesCalculator] }

        const permissions = await service.getOverviewPermissions(user, PrisonerMockDataA)

        expect(permissions.calculateReleaseDates).toEqual({
          view: false,
          edit: true,
        })
      })
    })

    describe('caseNotes', () => {
      it('should return edit true if prisoner is in users case loads', async () => {
        const permissions = await service.getOverviewPermissions(prisonUserMock, PrisonerMockDataA)

        expect(permissions.caseNotes).toEqual({
          view: false,
          edit: true,
        })
      })

      it('should return edit false if prisoner is not in users case loads', async () => {
        const user = {
          ...prisonUserMock,
          caseLoads: [{ caseLoadId: 'LEI', currentlyActive: true } as CaseLoad],
          userRoles: [Role.GlobalSearch],
        }

        const permissions = await service.getOverviewPermissions(user, PrisonerMockDataA)

        expect(permissions.caseNotes).toEqual({
          view: false,
          edit: false,
        })
      })

      it('should return edit true if user has GlobalSearch and PomUser roles', async () => {
        const user = {
          ...prisonUserMock,
          userRoles: [Role.GlobalSearch, Role.PomUser],
          caseLoads: [{ caseLoadId: 'LEI', currentlyActive: true } as CaseLoad],
        }

        const permissions = await service.getOverviewPermissions(user, PrisonerMockDataA)

        expect(permissions.caseNotes).toEqual({
          view: false,
          edit: true,
        })
      })

      it.each([Role.GlobalSearch, Role.PomUser])('should return edit false if user has only %s role', async role => {
        const user = {
          ...prisonUserMock,
          userRoles: [role],
          caseLoads: [{ caseLoadId: 'LEI', currentlyActive: true } as CaseLoad],
        }

        const permissions = await service.getOverviewPermissions(user, PrisonerMockDataA)

        expect(permissions.caseNotes).toEqual({
          view: false,
          edit: false,
        })
      })

      it('should return edit true if prisoner is out and user has inactive bookings role', async () => {
        const user = {
          ...prisonUserMock,
          userRoles: [Role.InactiveBookings],
          caseLoads: [{ caseLoadId: 'LEI', currentlyActive: true } as CaseLoad],
        }
        const prisoner = { ...PrisonerMockDataA, prisonId: 'OUT' }

        const permissions = await service.getOverviewPermissions(user, prisoner)

        expect(permissions.caseNotes).toEqual({
          view: false,
          edit: true,
        })
      })

      it('should return edit true if prisoner is restrictedPatient and user has pom role', async () => {
        const user = {
          ...prisonUserMock,
          restrictedPatient: true,
          userRoles: [Role.PomUser, Role.GlobalSearch],
          caseLoads: [{ caseLoadId: 'LEI', currentlyActive: true } as CaseLoad],
        }

        const permissions = await service.getOverviewPermissions(user, PrisonerMockDataA)

        expect(permissions.caseNotes).toEqual({
          view: false,
          edit: true,
        })
      })

      it('should return edit false if prisoner is restrictedPatient and user does not have pom role', async () => {
        const user = {
          ...prisonUserMock,
          restrictedPatient: true,
          userRoles: [Role.InactiveBookings, Role.GlobalSearch],
          caseLoads: [{ caseLoadId: 'LEI', currentlyActive: true } as CaseLoad],
        }

        const permissions = await service.getOverviewPermissions(user, PrisonerMockDataA)

        expect(permissions.caseNotes).toEqual({
          view: false,
          edit: false,
        })
      })
    })

    describe('keyWorker', () => {
      it('should return view true if user has KW role', async () => {
        userService.getStaffRoles = jest.fn().mockResolvedValue([{ role: 'KW' }])

        const permissions = await service.getOverviewPermissions(prisonUserMock, PrisonerMockDataA)

        expect(permissions.keyWorker).toEqual({
          view: false,
          edit: true,
        })
      })

      it('should return view false if user does not have KW role', async () => {
        userService.getStaffRoles = jest.fn().mockResolvedValue([])

        const permissions = await service.getOverviewPermissions(prisonUserMock, PrisonerMockDataA)

        expect(permissions.keyWorker).toEqual({
          view: false,
          edit: false,
        })
      })
    })

    describe('appointment', () => {
      it('should return edit true if prisoner is in users active caseload and not restrictedPatient', async () => {
        const permissions = await service.getOverviewPermissions(prisonUserMock, PrisonerMockDataA)

        expect(permissions.appointment).toEqual({
          view: false,
          edit: true,
        })
      })

      it('should return edit false if prisoner is not in users active caseload', async () => {
        const user = { ...prisonUserMock, activeCaseLoadId: 'LEI' }

        const permissions = await service.getOverviewPermissions(user, PrisonerMockDataA)

        expect(permissions.appointment).toEqual({
          view: false,
          edit: false,
        })
      })

      it('should return edit false if prisoner is restrictedPatient', async () => {
        const user = { ...prisonUserMock, userRoles: [Role.PomUser] }
        const prisoner = { ...PrisonerMockDataA, supportingPrisonId: 'MDI', restrictedPatient: true }

        const permissions = await service.getOverviewPermissions(user, prisoner)

        expect(permissions.appointment).toEqual({
          view: false,
          edit: false,
        })
      })
    })

    describe('useOfForce', () => {
      it('should return edit true if prisoner is in users case load list', async () => {
        const user = {
          ...prisonUserMock,
          userRoles: [Role.GlobalSearch],
          caseLoads: [
            { caseLoadId: 'MDI', currentlyActive: true } as CaseLoad,
            { caseLoadId: 'LEI', currentlyActive: false } as CaseLoad,
          ],
        }
        const prisoner = { ...PrisonerMockDataA, prisonId: 'LEI' }

        const permissions = await service.getOverviewPermissions(user, prisoner)

        expect(permissions.useOfForce).toEqual({
          view: false,
          edit: true,
        })
      })

      it('should return edit true if prisoner is out and user has inactive bookings role', async () => {
        const user = {
          ...prisonUserMock,
          userRoles: [Role.InactiveBookings],
          caseLoads: [{ caseLoadId: 'LEI', currentlyActive: true } as CaseLoad],
        }
        const prisoner = { ...PrisonerMockDataA, prisonId: 'OUT' }

        const permissions = await service.getOverviewPermissions(user, prisoner)

        expect(permissions.useOfForce).toEqual({
          view: false,
          edit: true,
        })
      })

      it('should return edit false if prisoner is restrictedPatient and user has pom role', async () => {
        const user = {
          ...prisonUserMock,
          restrictedPatient: true,
          userRoles: [Role.PomUser, Role.GlobalSearch],
          caseLoads: [{ caseLoadId: 'LEI', currentlyActive: true } as CaseLoad],
        }

        const permissions = await service.getOverviewPermissions(user, PrisonerMockDataA)

        expect(permissions.useOfForce).toEqual({
          view: false,
          edit: false,
        })
      })

      it('should return edit false if prisoner is restrictedPatient and user does not have pom role', async () => {
        const user = {
          ...prisonUserMock,
          restrictedPatient: true,
          userRoles: [Role.InactiveBookings, Role.GlobalSearch],
          caseLoads: [{ caseLoadId: 'LEI', currentlyActive: true } as CaseLoad],
        }

        const permissions = await service.getOverviewPermissions(user, PrisonerMockDataA)

        expect(permissions.useOfForce).toEqual({
          view: false,
          edit: false,
        })
      })
    })

    describe('activity', () => {
      it('should return edit true if user has activityHub role, user is in active caseload and status is not ACTIVE OUT', async () => {
        const user = { ...prisonUserMock, userRoles: [Role.ActivityHub] }

        const permissions = await service.getOverviewPermissions(user, PrisonerMockDataA)

        expect(permissions.activity).toEqual({
          view: false,
          edit: true,
        })
      })

      it('should return edit false if user doesnt have activityHub role', async () => {
        const user = { ...prisonUserMock, userRoles: [Role.GlobalSearch] }

        const permissions = await service.getOverviewPermissions(user, PrisonerMockDataA)

        expect(permissions.activity).toEqual({
          view: false,
          edit: false,
        })
      })

      it('should return edit false if prisoner is not in active case load', async () => {
        const user = { ...prisonUserMock, userRoles: [Role.ActivityHub, Role.GlobalSearch] }
        const prisoner = { ...PrisonerMockDataA, prisonId: 'LEI' }

        const permissions = await service.getOverviewPermissions(user, prisoner)

        expect(permissions.activity).toEqual({
          view: false,
          edit: false,
        })
      })

      it('should return edit false if prisoner status is ACTIVE OUT', async () => {
        const user = { ...prisonUserMock, userRoles: [Role.ActivityHub] }
        const prisoner = { ...PrisonerMockDataA, status: 'ACTIVE OUT' }

        const permissions = await service.getOverviewPermissions(user, prisoner)

        expect(permissions.activity).toEqual({
          view: false,
          edit: false,
        })
      })
    })

    describe('pathfinder', () => {
      it.each([
        Role.PathfinderApproval,
        Role.PathfinderStdPrison,
        Role.PathfinderStdProbation,
        Role.PathfinderHQ,
        Role.PathfinderUser,
        Role.PathfinderLocalReader,
        Role.PathfinderNationalReader,
        Role.PathfinderPolice,
        Role.PathfinderPsychologist,
      ])('should return view true if user has %s role', async role => {
        const user = { ...prisonUserMock, userRoles: [role] }

        const permissions = await service.getOverviewPermissions(user, PrisonerMockDataA)

        expect(permissions.pathfinder.view).toEqual(true)
      })

      it.each([
        Role.PathfinderApproval,
        Role.PathfinderStdPrison,
        Role.PathfinderStdProbation,
        Role.PathfinderHQ,
        Role.PathfinderUser,
      ])('should return edit true if user has %s role', async role => {
        const user = { ...prisonUserMock, userRoles: [role] }

        const permissions = await service.getOverviewPermissions(user, PrisonerMockDataA)

        expect(permissions.pathfinder.edit).toEqual(true)
      })

      it.each([
        Role.PathfinderLocalReader,
        Role.PathfinderNationalReader,
        Role.PathfinderPolice,
        Role.PathfinderPsychologist,
      ])('should return view true, edit false if user has %s role', async role => {
        const user = { ...prisonUserMock, userRoles: [role] }

        const permissions = await service.getOverviewPermissions(user, PrisonerMockDataA)

        expect(permissions.pathfinder).toEqual({
          view: true,
          edit: false,
        })
      })

      it('should return view and edit false if user has no pathfinder roles', async () => {
        const permissions = await service.getOverviewPermissions(prisonUserMock, PrisonerMockDataA)

        expect(permissions.pathfinder).toEqual({
          view: false,
          edit: false,
        })
      })
    })

    describe('soc', () => {
      it.each([Role.SocCommunity, Role.SocCustody])('should return view true if user has %s role', async role => {
        const user = { ...prisonUserMock, userRoles: [role] }

        const permissions = await service.getOverviewPermissions(user, PrisonerMockDataA)

        expect(permissions.soc.view).toEqual(true)
      })

      // Odd rule, one to look into
      it.each([Role.SocCustody, Role.SocCommunity, Role.SocDataAnalyst, Role.SocDataManager])(
        'should return edit true if user has %s role',
        async role => {
          const user = { ...prisonUserMock, userRoles: [role] }

          const permissions = await service.getOverviewPermissions(user, PrisonerMockDataA)

          expect(permissions.soc.edit).toEqual(true)
        },
      )

      it.each([Role.SocDataAnalyst, Role.SocDataManager])(
        'should return view false, edit true if user has %s role',
        async role => {
          const user = { ...prisonUserMock, userRoles: [role] }

          const permissions = await service.getOverviewPermissions(user, PrisonerMockDataA)

          expect(permissions.soc).toEqual({
            view: false,
            edit: true,
          })
        },
      )

      it('should return view and edit false if user has no pathfinder roles', async () => {
        const permissions = await service.getOverviewPermissions(prisonUserMock, PrisonerMockDataA)

        expect(permissions.soc).toEqual({
          view: false,
          edit: false,
        })
      })
    })

    describe('offenderCategorisation', () => {
      it.each([
        Role.CreateCategorisation,
        Role.ApproveCategorisation,
        Role.CreateRecategorisation,
        Role.CategorisationSecurity,
      ])('should return edit true if user has %s role', async role => {
        const user = { ...prisonUserMock, userRoles: [role] }

        const permissions = await service.getOverviewPermissions(user, PrisonerMockDataA)

        expect(permissions.offenderCategorisation).toEqual({
          view: false,
          edit: true,
        })
      })

      it('should return view and edit false if user has no offenderCategorisation roles', async () => {
        const permissions = await service.getOverviewPermissions(prisonUserMock, PrisonerMockDataA)

        expect(permissions.offenderCategorisation).toEqual({
          view: false,
          edit: false,
        })
      })
    })

    describe('probationDocuments', () => {
      it.each([Role.PomUser, Role.ViewProbationDocuments])(
        'should return view true if user has %s role and prisoner in caseload',
        async role => {
          const user = { ...prisonUserMock, userRoles: [role] }

          const permissions = await service.getOverviewPermissions(user, PrisonerMockDataA)

          expect(permissions.probationDocuments).toEqual({
            view: true,
          })
        },
      )

      it('should return view false if user has no probationDocuments roles', async () => {
        const permissions = await service.getOverviewPermissions(prisonUserMock, PrisonerMockDataA)

        expect(permissions.probationDocuments).toEqual({
          view: false,
        })
      })

      it('should return view false if user not in caseload', async () => {
        const user = { ...prisonUserMock, userRoles: [Role.GlobalSearch, Role.ViewProbationDocuments] }
        const prisoner = { ...PrisonerMockDataA, prisonId: 'LEI' }

        const permissions = await service.getOverviewPermissions(user, prisoner)

        expect(permissions.probationDocuments).toEqual({
          view: false,
        })
      })
    })
  })

  describe('getMoneyPermissions', () => {
    describe('accessCode', () => {
      it('should return NOT_IN_CASELOAD if user not in caseload', () => {
        const user = { ...prisonUserMock, userRoles: [Role.InactiveBookings, Role.GlobalSearch] }
        const prisoner = { ...PrisonerMockDataA, restrictedPatient: true, prisonId: 'LEI' }

        const permissions = service.getMoneyPermissions(user, prisoner)

        expect(permissions.accessCode).toEqual(HmppsStatusCode.NOT_IN_CASELOAD)
      })

      it('should return PRISONER_IS_RELEASED if prisonId is OUT', () => {
        const user = { ...prisonUserMock, userRoles: [Role.InactiveBookings, Role.GlobalSearch] }
        const prisoner = { ...PrisonerMockDataA, restrictedPatient: true, prisonId: 'OUT' }

        const permissions = service.getMoneyPermissions(user, prisoner)

        expect(permissions.accessCode).toEqual(HmppsStatusCode.PRISONER_IS_RELEASED)
      })

      it('should return PRISONER_IS_TRANSFERRING if prisonId is TRN', () => {
        const user = { ...prisonUserMock, userRoles: [Role.InactiveBookings, Role.GlobalSearch] }
        const prisoner = { ...PrisonerMockDataA, restrictedPatient: true, prisonId: 'TRN' }

        const permissions = service.getMoneyPermissions(user, prisoner)

        expect(permissions.accessCode).toEqual(HmppsStatusCode.PRISONER_IS_TRANSFERRING)
      })
    })
  })
})
