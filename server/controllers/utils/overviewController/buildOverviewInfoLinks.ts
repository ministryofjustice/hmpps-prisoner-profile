import Prisoner from '../../../data/interfaces/prisonerSearchApi/Prisoner'
import Nominal from '../../../data/interfaces/manageSocCasesApi/Nominal'
import config from '../../../config'
import { Permissions } from '../../../services/permissionsService'

export default function buildOverviewInfoLinks(
  prisonerData: Prisoner,
  pathfinderNominal: Nominal,
  socNominal: Nominal,
  permissions: Permissions,
): { text: string; url: string; dataQA: string }[] {
  const links: { text: string; url: string; dataQA: string }[] = []

  if (permissions.probationDocuments?.view) {
    links.push({
      text: 'Probation documents',
      url: `/prisoner/${prisonerData.prisonerNumber}/probation-documents`,
      dataQA: 'probation-documents-info-link',
    })
  }

  if (permissions.pathfinder?.view && pathfinderNominal) {
    links.push({
      text: 'Pathfinder profile',
      url: `${config.serviceUrls.pathfinder}/nominal/${pathfinderNominal.id}`,
      dataQA: 'pathfinder-profile-info-link',
    })
  }

  if (permissions.soc?.view && socNominal) {
    links.push({
      text: 'SOC profile',
      url: `${config.serviceUrls.manageSocCases}/nominal/${socNominal.id}`,
      dataQA: 'soc-profile-info-link',
    })
  }

  return links
}
