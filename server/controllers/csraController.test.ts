import { Request, Response } from 'express'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { Role } from '../data/enums/role'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import CsraController from './csraController'
import CsraService, { AssessmentListViewModel } from '../services/csraService'
import { AgencyDetails } from '../data/interfaces/prisonApi/Agency'
import AgencyMock from '../data/localMockData/agency'
import StaffDetailsMock from '../data/localMockData/staffDetails'
import csraAssessmentMock from '../data/localMockData/csraAssessmentMock'
import csraAssessmentSummaryMock from '../data/localMockData/csraAssessmentSummaryMock'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { CsraSummary } from '../mappers/csraAssessmentsToSummaryListMapper'

let req: Request
let res: Response
let controller: CsraController

describe('CSRA Controller', () => {
  describe('CSRA review page', () => {
    beforeEach(() => {
      req = {
        params: { prisonerNumber: '' },
        query: { assessmentSeq: '123', bookingId: '456' },
        path: 'alerts/active',
        middleware: {
          clientToken: 'CLIENT_TOKEN',
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
        },
      } as unknown as Request
      res = {
        locals: {
          user: {
            activeCaseLoadId: 'MDI',
            userRoles: [Role.UpdateAlert],
            caseLoads: CaseLoadsDummyDataA,
            token: 'TOKEN',
          },
        },
        render: jest.fn(),
      } as unknown as Response
      controller = new CsraController(new CsraService(null), auditServiceMock())
    })

    it('should return the data from the services', async () => {
      jest.spyOn(controller.csraService, 'getCsraAssessment').mockResolvedValue({
        csraAssessment: csraAssessmentMock,
        agencyDetails: AgencyMock as AgencyDetails,
        staffDetails: StaffDetailsMock,
      })

      await controller.displayReview(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/csra/csraReviewPage', {
        pageTitle: 'CSRA details',
        csraAssessment: csraAssessmentMock,
        agencyDetails: AgencyMock,
        staffDetails: StaffDetailsMock,
        prisoner: PrisonerMockDataA,
      })
    })
  })

  describe('CSRA history page', () => {
    beforeEach(() => {
      req = {
        params: { prisonerNumber: '' },
        path: 'alerts/active',
        middleware: {
          clientToken: 'CLIENT_TOKEN',
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
        },
        query: {},
      } as unknown as Request
      res = {
        locals: {
          user: {
            activeCaseLoadId: 'MDI',
            userRoles: [Role.UpdateAlert],
            caseLoads: CaseLoadsDummyDataA,
            token: 'TOKEN',
          },
        },
        render: jest.fn(),
      } as unknown as Response
      controller = new CsraController(new CsraService(null), auditServiceMock())
    })

    it('should map the csra assessments to summaries', async () => {
      jest
        .spyOn(controller.csraService, 'getCsraHistory')
        .mockResolvedValue([
          { ...csraAssessmentSummaryMock, assessmentAgencyId: AgencyMock.agencyId },
          csraAssessmentSummaryMock,
        ])

      jest
        .spyOn(controller.csraService, 'getAgenciesForCsraAssessments')
        .mockResolvedValue([AgencyMock, AgencyMock] as AgencyDetails[])

      jest.spyOn(controller.csraService, 'getDetailsForAssessments').mockImplementation((_, args: CsraSummary[]) =>
        Promise.resolve(
          args.map(
            arg =>
              ({
                ...csraAssessmentMock,
                ...arg,
              }) as AssessmentListViewModel,
          ),
        ),
      )

      await controller.displayHistory(req, res)

      const expectedOutput = {
        ...csraAssessmentMock,
        assessmentComment: 'HiMEIesRHiMEIesR',
        assessmentDate: '2017-01-12',
        classification: 'Standard',
        location: 'Sheffield Crown Court',
        assessmentSeq: 4,
        bookingId: 111111,
        offenderNo: 'A11111',
        classificationCode: 'STANDARD',
        assessmentAgencyId: 'SHEFCC',
      }

      expect(res.render).toHaveBeenCalledWith(
        'pages/csra/prisonerCsraHistoryPage',
        expect.objectContaining({
          csraAssessments: [expectedOutput, { ...expectedOutput, location: 'Not entered', assessmentAgencyId: 'HLI' }],
        }),
      )
    })

    describe('with filters', () => {
      beforeEach(() => {
        req = {
          params: { prisonerNumber: '' },
          path: 'alerts/active',
          middleware: {
            clientToken: 'CLIENT_TOKEN',
            prisonerData: PrisonerMockDataA,
            inmateDetail: inmateDetailMock,
          },
          query: {},
        } as unknown as Request
        res = {
          locals: {
            user: {
              activeCaseLoadId: 'MDI',
              userRoles: [Role.UpdateAlert],
              caseLoads: CaseLoadsDummyDataA,
              token: 'TOKEN',
            },
          },
          render: jest.fn(),
        } as unknown as Response
        controller = new CsraController(new CsraService(null), auditServiceMock())
      })

      it('should get values to use for filters and filter out those with no location', async () => {
        const reqWithQuery = {
          ...req,
          query: {
            csra: 'STANDARD',
            location: [csraAssessmentMock.assessmentAgencyId, AgencyMock.agencyId],
          },
        } as unknown as Request

        jest
          .spyOn(controller.csraService, 'getCsraHistory')
          .mockResolvedValue([
            { ...csraAssessmentSummaryMock, assessmentAgencyId: AgencyMock.agencyId, classificationCode: 'MED' },
            csraAssessmentSummaryMock,
          ])

        jest
          .spyOn(controller.csraService, 'getAgenciesForCsraAssessments')
          .mockResolvedValue([AgencyMock, AgencyMock] as AgencyDetails[])

        jest.spyOn(controller.csraService, 'getDetailsForAssessments').mockImplementation((_, args: CsraSummary[]) =>
          Promise.resolve(
            args.map(
              arg =>
                ({
                  ...csraAssessmentMock,
                  ...arg,
                }) as AssessmentListViewModel,
            ),
          ),
        )

        await controller.displayHistory(reqWithQuery, res)

        expect(res.render).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            filterValues: {
              establishments: [{ checked: true, text: 'Sheffield Crown Court', value: 'SHEFCC' }],
              from: undefined,
              csraLevels: [
                { checked: false, text: 'Medium', value: 'MED' },
                { checked: true, text: 'Standard', value: 'STANDARD' },
              ],
              to: undefined,
            },
          }),
        )
      })

      it('should validate date filters', async () => {
        const reqWithQuery = {
          ...req,
          query: {
            to: '19/03/2020',
            from: '20/03/2020',
          },
        } as unknown as Request
        jest
          .spyOn(controller.csraService, 'getCsraHistory')
          .mockResolvedValue([
            { ...csraAssessmentSummaryMock, assessmentAgencyId: AgencyMock.agencyId, classificationCode: 'MED' },
            csraAssessmentSummaryMock,
          ])

        jest
          .spyOn(controller.csraService, 'getAgenciesForCsraAssessments')
          .mockResolvedValue([AgencyMock, AgencyMock] as AgencyDetails[])

        jest.spyOn(controller.csraService, 'getDetailsForAssessments').mockImplementation((_, args: CsraSummary[]) =>
          Promise.resolve(
            args.map(
              arg =>
                ({
                  ...csraAssessmentMock,
                  ...arg,
                }) as AssessmentListViewModel,
            ),
          ),
        )

        await controller.displayHistory(reqWithQuery, res)

        expect(res.render).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            csraAssessments: [],
            errors: [
              {
                href: '#endDate',
                text: "'Date to (latest)' must be after or the same as 'Date from (earliest) '",
              },
            ],
          }),
        )
      })

      it('should return the filtered assessments', async () => {
        const reqWithQuery = {
          ...req,
          query: {
            location: AgencyMock.agencyId,
          },
        } as unknown as Request
        jest
          .spyOn(controller.csraService, 'getCsraHistory')
          .mockResolvedValue([
            { ...csraAssessmentSummaryMock, assessmentAgencyId: AgencyMock.agencyId, classificationCode: 'MED' },
            csraAssessmentSummaryMock,
          ])

        jest
          .spyOn(controller.csraService, 'getAgenciesForCsraAssessments')
          .mockResolvedValue([AgencyMock, AgencyMock] as AgencyDetails[])

        jest.spyOn(controller.csraService, 'getDetailsForAssessments').mockImplementation((_, args: CsraSummary[]) =>
          Promise.resolve(
            args.map(
              arg =>
                ({
                  ...csraAssessmentMock,
                  ...arg,
                }) as AssessmentListViewModel,
            ),
          ),
        )

        await controller.displayHistory(reqWithQuery, res)

        expect(res.render).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            csraAssessments: [
              expect.objectContaining({
                assessmentAgencyId: AgencyMock.agencyId,
              }),
            ],
            errors: undefined,
          }),
        )
      })
    })
  })
})
