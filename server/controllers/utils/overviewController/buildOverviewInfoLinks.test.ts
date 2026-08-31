import {
  PathfinderPermission,
  PrisonerPermissions,
  ProbationDocumentsPermission,
  SOCPermission,
} from '@ministryofjustice/hmpps-prison-permissions-lib'
import buildOverviewInfoLinks from './buildOverviewInfoLinks'
import { PrisonerMockDataA } from '../../../data/localMockData/prisoner'
import config from '../../../config'
import mockPermissions from '../../../../tests/mocks/mockPermissions'

jest.mock('@ministryofjustice/hmpps-prison-permissions-lib')

const pathfinderNominal = { id: 1 }
const socNominal = { id: 2 }
const permissions = {} as PrisonerPermissions

describe('buildOverviewInfoLinks', () => {
  describe('Probation documents', () => {
    it.each([true, false])(`User with permission can see 'Probation documents' link: %s`, permissionGranted => {
      mockPermissions({ [ProbationDocumentsPermission.read]: permissionGranted })

      const resp = buildOverviewInfoLinks(PrisonerMockDataA, pathfinderNominal, socNominal, permissions)

      expect(resp.some(link => link.dataQA === 'probation-documents-info-link')).toEqual(permissionGranted)
    })
  })

  describe('Incident summary', () => {
    it('is always shown (caseload gating is handled by the sidebar)', () => {
      mockPermissions({
        [ProbationDocumentsPermission.read]: false,
        [PathfinderPermission.read]: false,
        [SOCPermission.read]: false,
      })

      const resp = buildOverviewInfoLinks(PrisonerMockDataA, pathfinderNominal, socNominal, permissions)

      const link = resp.find(l => l.dataQA === 'incident-summary-info-link')
      expect(link).toEqual({
        text: 'Incident summary',
        url: `${config.serviceUrls.incidentReporting}/prisoner/${PrisonerMockDataA.prisonerNumber}/incident-summary`,
        dataQA: 'incident-summary-info-link',
      })
    })
  })
})
