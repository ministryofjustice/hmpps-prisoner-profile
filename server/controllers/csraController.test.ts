import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { Role } from '../data/enums/role'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import CsraController from './csraController'
import CsraService from '../services/csraService'
import AgencyMock from '../data/localMockData/agency'
import StaffDetailsMock from '../data/localMockData/staffDetails'
import csraAssessmentMock from '../data/localMockData/csraAssessmentMock'

let req: any
let res: any
let next: any
let controller: CsraController

describe('CSRA Controller', () => {
  describe('CSRA review page', () => {
    beforeEach(() => {
      req = {
        params: { prisonerNumber: '' },
        query: { assessmentSeq: '123', bookingId: '456' },
        path: 'alerts/active',
        middleware: {
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
        },
      }
      res = {
        locals: {
          user: {
            activeCaseLoadId: 'MDI',
            userRoles: [Role.UpdateAlert],
            caseLoads: CaseLoadsDummyDataA,
            token: 'TOKEN',
          },
          clientToken: 'CLIENT_TOKEN',
        },
        render: jest.fn(),
      }
      next = jest.fn()
      controller = new CsraController(new CsraService(null))
    })

    it('should map the csra review details and questions to summary rows', async () => {
      jest.spyOn<any, string>(controller['csraService'], 'getCsraAssessment').mockResolvedValue({
        csraAssessment: csraAssessmentMock,
        agencyDetails: AgencyMock,
        staffDetails: StaffDetailsMock,
      })

      await controller.displayReview(req, res, next)

      const expectedDetails = [
        {
          key: { text: 'CSRA' },
          value: { text: 'Standard' },
        },
        {
          key: { text: 'Authorised by' },
          value: { text: 'Review Board' },
        },
        {
          key: { text: 'Location', classes: 'govuk-!-padding-top-6' },
          value: { text: 'Sheffield Crown Court' },
        },
        {
          key: { text: 'Comments' },
          value: { text: 'HiMEIesRHiMEIesR' },
        },
        { key: { text: 'Reviewed by' }, value: { text: 'Reception - John Smith' } },
        {
          key: { text: 'Next review date' },
          value: { text: '13 January 2018' },
        },
      ]

      const expectedQuestions = [
        {
          key: {
            classes: 'govuk-!-font-weight-regular',
            text: 'Select Risk Rating',
          },
          value: {
            text: 'Standard',
          },
        },
      ]

      expect(res.render).toHaveBeenCalledWith('pages/csra/csraReviewPage', {
        pageTitle: 'CSRA details',
        details: expectedDetails,
        prisonerName: 'John Saunders',
        prisonerNumber: 'G6123VU',
        reviewDate: '12 January 2017',
        reviewQuestions: expectedQuestions,
      })
    })

    it('should handle staff details and agency details being null', async () => {
      jest.spyOn<any, string>(controller['csraService'], 'getCsraAssessment').mockResolvedValue({
        csraAssessment: csraAssessmentMock,
        agencyDetails: null,
        staffDetails: null,
      })

      await controller.displayReview(req, res, next)

      const expectedDetails = [
        {
          key: { text: 'CSRA' },
          value: { text: 'Standard' },
        },
        {
          key: { text: 'Authorised by' },
          value: { text: 'Review Board' },
        },
        {
          key: { text: 'Location', classes: 'govuk-!-padding-top-6' },
          value: { text: 'Not entered' },
        },
        {
          key: { text: 'Comments' },
          value: { text: 'HiMEIesRHiMEIesR' },
        },
        { key: { text: 'Reviewed by' }, value: { text: 'Reception - Not entered' } },
        {
          key: { text: 'Next review date' },
          value: { text: '13 January 2018' },
        },
      ]

      const expectedQuestions = [
        {
          key: {
            classes: 'govuk-!-font-weight-regular',
            text: 'Select Risk Rating',
          },
          value: {
            text: 'Standard',
          },
        },
      ]

      expect(res.render).toHaveBeenCalledWith('pages/csra/csraReviewPage', {
        pageTitle: 'CSRA details',
        details: expectedDetails,
        prisonerName: 'John Saunders',
        prisonerNumber: 'G6123VU',
        reviewDate: '12 January 2017',
        reviewQuestions: expectedQuestions,
      })
    })

    it('should display override information if present', async () => {
      jest.spyOn<any, string>(controller['csraService'], 'getCsraAssessment').mockResolvedValue({
        csraAssessment: {
          ...csraAssessmentMock,
          originalClassificationCode: 'HI',
          classificationReviewReason: 'A reason',
        },
        agencyDetails: AgencyMock,
        staffDetails: StaffDetailsMock,
      })

      await controller.displayReview(req, res, next)

      const expectedDetails = [
        {
          key: { text: 'CSRA' },
          value: { text: 'Standard - this is an override from High' },
        },
        {
          key: { text: 'Override reason' },
          value: { text: 'A reason' },
        },
        {
          key: { text: 'Authorised by' },
          value: { text: 'Review Board' },
        },
        {
          key: { text: 'Location', classes: 'govuk-!-padding-top-6' },
          value: { text: 'Sheffield Crown Court' },
        },
        {
          key: { text: 'Comments' },
          value: { text: 'HiMEIesRHiMEIesR' },
        },
        { key: { text: 'Reviewed by' }, value: { text: 'Reception - John Smith' } },
        {
          key: { text: 'Next review date' },
          value: { text: '13 January 2018' },
        },
      ]

      expect(res.render.mock.calls[0][1].details).toEqual(expectedDetails)
    })

    it('should handle details not being present', async () => {
      jest.spyOn<any, string>(controller['csraService'], 'getCsraAssessment').mockResolvedValue({
        csraAssessment: { ...csraAssessmentMock, assessmentComment: '' },
        agencyDetails: { ...AgencyMock, description: '' },
        staffDetails: StaffDetailsMock,
      })

      await controller.displayReview(req, res, next)

      const expectedDetails = [
        {
          key: { text: 'CSRA' },
          value: { text: 'Standard' },
        },
        {
          key: { text: 'Authorised by' },
          value: { text: 'Review Board' },
        },
        {
          key: { text: 'Location', classes: 'govuk-!-padding-top-6' },
          value: { text: 'Not entered' },
        },
        {
          key: { text: 'Comments' },
          value: { text: 'Not entered' },
        },
        { key: { text: 'Reviewed by' }, value: { text: 'Reception - John Smith' } },
        {
          key: { text: 'Next review date' },
          value: { text: '13 January 2018' },
        },
      ]

      expect(res.render.mock.calls[0][1].details).toEqual(expectedDetails)
    })
  })

  describe('CSRA history page', () => {
    beforeEach(() => {
      req = {
        params: { prisonerNumber: '' },
        path: 'alerts/active',
        middleware: {
          prisonerData: PrisonerMockDataA,
          inmateDetail: inmateDetailMock,
        },
        query: {},
      }
      res = {
        locals: {
          user: {
            activeCaseLoadId: 'MDI',
            userRoles: [Role.UpdateAlert],
            caseLoads: CaseLoadsDummyDataA,
            token: 'TOKEN',
          },
          clientToken: 'CLIENT_TOKEN',
        },
        render: jest.fn(),
      }
      next = jest.fn()
      controller = new CsraController(new CsraService(null))
    })

    it('should map the csra assessments to summaries', async () => {
      jest
        .spyOn<any, string>(controller['csraService'], 'getCsraHistory')
        .mockResolvedValue([{ ...csraAssessmentMock, assessmentAgencyId: AgencyMock.agencyId }, csraAssessmentMock])

      jest
        .spyOn<any, string>(controller['csraService'], 'getAgenciesForCsraAssessments')
        .mockResolvedValue([AgencyMock, AgencyMock])

      await controller.displayHistory(req, res, next)

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

      expect(res.render.mock.calls[0][0]).toEqual('pages/csra/prisonerCsraHistoryPage')
      expect(res.render.mock.calls[0][1].name).toEqual('John Saunders')
      expect(res.render.mock.calls[0][1].prisonerNumber).toEqual('G6123VU')
      expect(res.render.mock.calls[0][1].csraAssessments).toEqual([
        expectedOutput,
        { ...expectedOutput, location: 'Not entered', assessmentAgencyId: 'HLI' },
      ])
    })

    describe('with filters', () => {
      beforeEach(() => {
        req = {
          params: { prisonerNumber: '' },
          path: 'alerts/active',
          middleware: {
            prisonerData: PrisonerMockDataA,
            inmateDetail: inmateDetailMock,
          },
          query: {},
        }
        res = {
          locals: {
            user: {
              activeCaseLoadId: 'MDI',
              userRoles: [Role.UpdateAlert],
              caseLoads: CaseLoadsDummyDataA,
              token: 'TOKEN',
            },
            clientToken: 'CLIENT_TOKEN',
          },
          render: jest.fn(),
        }
        next = jest.fn()
        controller = new CsraController(new CsraService(null))
      })

      it('should get values to use for filters and filter out those with no location', async () => {
        const reqWithQuery = {
          ...req,
          query: {
            csra: 'STANDARD',
            location: [csraAssessmentMock.assessmentAgencyId, AgencyMock.agencyId],
          },
        }
        jest
          .spyOn<any, string>(controller['csraService'], 'getCsraHistory')
          .mockResolvedValue([
            { ...csraAssessmentMock, assessmentAgencyId: AgencyMock.agencyId, classificationCode: 'MED' },
            csraAssessmentMock,
          ])

        jest
          .spyOn<any, string>(controller['csraService'], 'getAgenciesForCsraAssessments')
          .mockResolvedValue([AgencyMock, AgencyMock])

        await controller.displayHistory(reqWithQuery, res, next)
        expect(res.render.mock.calls[0][1].filterValues).toEqual({
          establishments: [{ checked: true, text: 'Sheffield Crown Court', value: 'SHEFCC' }],
          from: undefined,
          incentiveLevels: [
            { checked: false, text: 'Medium', value: 'MED' },
            { checked: true, text: 'Standard', value: 'STANDARD' },
          ],
          to: undefined,
        })
      })

      it('should validate date filters', async () => {
        const reqWithQuery = {
          ...req,
          query: {
            to: '19/03/2020',
            from: '20/03/2020',
          },
        }
        jest
          .spyOn<any, string>(controller['csraService'], 'getCsraHistory')
          .mockResolvedValue([
            { ...csraAssessmentMock, assessmentAgencyId: AgencyMock.agencyId, classificationCode: 'MED' },
            csraAssessmentMock,
          ])

        jest
          .spyOn<any, string>(controller['csraService'], 'getAgenciesForCsraAssessments')
          .mockResolvedValue([AgencyMock, AgencyMock])

        await controller.displayHistory(reqWithQuery, res, next)
        expect(res.render.mock.calls[0][1].csraAssessments).toEqual([])
        expect(res.render.mock.calls[0][1].errors).toEqual([
          {
            href: '#endDate',
            text: "'Date to (latest)' must be after or the same as 'Date from (earliest) '",
          },
        ])
      })

      it('should return ther filtered assessments', async () => {
        const reqWithQuery = {
          ...req,
          query: {
            location: AgencyMock.agencyId,
          },
        }
        jest
          .spyOn<any, string>(controller['csraService'], 'getCsraHistory')
          .mockResolvedValue([
            { ...csraAssessmentMock, assessmentAgencyId: AgencyMock.agencyId, classificationCode: 'MED' },
            csraAssessmentMock,
          ])

        jest
          .spyOn<any, string>(controller['csraService'], 'getAgenciesForCsraAssessments')
          .mockResolvedValue([AgencyMock, AgencyMock])

        await controller.displayHistory(reqWithQuery, res, next)
        expect(res.render.mock.calls[0][1].csraAssessments).toHaveLength(1)
        expect(res.render.mock.calls[0][1].csraAssessments[0].assessmentAgencyId).toEqual(AgencyMock.agencyId)
        expect(res.render.mock.calls[0][1].errors).toEqual(undefined)
      })
    })
  })
})
