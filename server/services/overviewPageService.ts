import { statuses, personalDetails, staffContacts, schedule } from '../data/overviewPage'
import { miniSummaryParamGroupA, miniSummaryParamGroupB } from '../data/miniSummary/miniSummary'
import { OverviewPage, OverviewNonAssociation } from '../interfaces/overviewPage'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'

export default class OverviewPageService {
  private prisonApiClient: PrisonApiClient

  constructor(prisonApiClient: PrisonApiClient) {
    this.prisonApiClient = prisonApiClient
  }

  public async get(prisonerNumber: string): Promise<OverviewPage> {
    const nonAssociations = await this.getNonAssociations(prisonerNumber)
    return {
      miniSummaryParamGroupA,
      miniSummaryParamGroupB,
      statuses,
      nonAssociations,
      personalDetails,
      staffContacts,
      schedule,
    }
  }

  private async getNonAssociations(prisonerNumber: string): Promise<OverviewNonAssociation[]> {
    const nonAssociations = await this.prisonApiClient.getNonAssociationDetails(prisonerNumber)
    return nonAssociations.nonAssociations
      .filter(nonassociation => {
        return nonassociation.offenderNonAssociation.agencyDescription === nonAssociations.agencyDescription
      })
      .map(nonAssocation => {
        const { offenderNonAssociation } = nonAssocation
        const nonAssociationName = `${offenderNonAssociation.firstName} ${offenderNonAssociation.lastName}`
        return [
          { text: nonAssociationName },
          { text: offenderNonAssociation.offenderNo },
          { text: offenderNonAssociation.assignedLivingUnitDescription },
          { text: offenderNonAssociation.reasonDescription },
        ]
      })
  }
}
