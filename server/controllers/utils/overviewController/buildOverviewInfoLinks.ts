import Prisoner from '../../../data/interfaces/prisonerSearchApi/Prisoner'
import Nominal from '../../../data/interfaces/manageSocCasesApi/Nominal'
import { User } from '../../../data/hmppsAuthClient'
import { prisonerBelongsToUsersCaseLoad, userHasRoles } from '../../../utils/utils'
import { Role } from '../../../data/enums/role'
import config from '../../../config'

export default function buildOverviewInfoLinks(
  prisonerData: Prisoner,
  pathfinderNominal: Nominal,
  socNominal: Nominal,
  user: User,
): { text: string; url: string; dataQA: string }[] {
  const links: { text: string; url: string; dataQA: string }[] = []

  if (
    userHasRoles([Role.PomUser, Role.ViewProbationDocuments], user.userRoles) &&
    (prisonerBelongsToUsersCaseLoad(prisonerData.prisonId, user.caseLoads) ||
      ['OUT', 'TRN'].includes(prisonerData.prisonId))
  ) {
    links.push({
      text: 'Probation documents',
      url: `/prisoner/${prisonerData.prisonerNumber}/probation-documents`,
      dataQA: 'probation-documents-info-link',
    })
  }

  if (
    userHasRoles(
      [
        Role.PathfinderApproval,
        Role.PathfinderStdPrison,
        Role.PathfinderStdProbation,
        Role.PathfinderHQ,
        Role.PathfinderUser,
        Role.PathfinderLocalReader,
        Role.PathfinderNationalReader,
        Role.PathfinderPolice,
        Role.PathfinderPsychologist,
      ],
      user.userRoles,
    ) &&
    pathfinderNominal
  ) {
    links.push({
      text: 'Pathfinder profile',
      url: `${config.serviceUrls.pathfinder}/nominal/${pathfinderNominal.id}`,
      dataQA: 'pathfinder-profile-info-link',
    })
  }

  if (userHasRoles([Role.SocCommunity, Role.SocCustody], user.userRoles) && socNominal) {
    links.push({
      text: 'SOC profile',
      url: `${config.serviceUrls.manageSocCases}/nominal/${socNominal.id}`,
      dataQA: 'soc-profile-info-link',
    })
  }

  return links
}
