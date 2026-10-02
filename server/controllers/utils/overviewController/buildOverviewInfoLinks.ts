import {
  isGranted,
  PathfinderPermission,
  PrisonerPermissions,
  ProbationDocumentsPermission,
  SOCPermission,
} from '@ministryofjustice/hmpps-prison-permissions-lib'
import Prisoner from '../../../data/interfaces/prisonerSearchApi/Prisoner'
import Nominal from '../../../data/interfaces/manageSocCasesApi/Nominal'
import config from '../../../config'

export default function buildOverviewInfoLinks(
  prisonerData: Prisoner,
  pathfinderNominal: Nominal | null,
  socNominal: Nominal | null,
  permissions: PrisonerPermissions,
): { text: string; url: string; dataQA: string }[] {
  const links: { text: string; url: string; dataQA: string }[] = []

  if (isGranted(ProbationDocumentsPermission.read, permissions)) {
    links.push({
      text: 'Probation documents',
      url: `/prisoner/${prisonerData.prisonerNumber}/probation-documents`,
      dataQA: 'probation-documents-info-link',
    })
  }

  if (isGranted(PathfinderPermission.read, permissions) && pathfinderNominal) {
    links.push({
      text: 'Pathfinder profile',
      url: `${config.serviceUrls.pathfinder}/nominal/${pathfinderNominal.id}`,
      dataQA: 'pathfinder-profile-info-link',
    })
  }

  if (isGranted(SOCPermission.read, permissions) && socNominal) {
    links.push({
      text: 'SOC profile',
      url: `${config.serviceUrls.manageSocCases}/nominal/${socNominal.id}`,
      dataQA: 'soc-profile-info-link',
    })
  }

  // Visibility is gated by the sidebar's caseload check (isInUsersCaseLoad), so no
  // additional permission is required: any user who can see the prisoner can view the
  // incident summary.
  links.push({
    text: 'Incident summary',
    url: `${config.serviceUrls.incidentReporting}/prisoner/${prisonerData.prisonerNumber}/incident-summary`,
    dataQA: 'incident-summary-info-link',
  })

  return links
}
