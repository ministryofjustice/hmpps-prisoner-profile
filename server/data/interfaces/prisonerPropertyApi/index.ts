/**
 * A single prisoner's property totals, as returned by
 * `GET /property-containers/prisoner/{prisonerNumber}/summary`. Counts cover the person's active
 * (not removed) containers, split by where they are held relative to their current establishment.
 */
export interface PrisonerPropertySummary {
  /** The prisoner's current establishment id, or null if they are released or in transit */
  currentEstablishmentId: string | null
  /** The prisoner's current establishment name, or null if unknown/released/in transit */
  currentEstablishmentName: string | null
  /** Active containers physically held at the prisoner's current establishment */
  heldInCurrentEstablishment: number
  /** Active containers held at any other establishment */
  heldInOtherEstablishments: number
  /** Containers held elsewhere due to be transferred in. A subset of heldInOtherEstablishments. */
  dueForTransferIn: number
  /** Containers held here that are due to be transferred out */
  dueForTransferOut: number
  /** Containers whose proposed disposal date has arisen */
  overdueForDisposal: number
  /** Containers flagged due for return following the prisoner's release */
  overdueForReturn: number
  /** Whether the prisoner has any recorded property at all, including returned/disposed/transferred */
  hasEverHadProperty: boolean
}

export interface PrisonerPropertyApiClient {
  getPrisonerPropertySummary(prisonerNumber: string): Promise<PrisonerPropertySummary>
  getActiveAgencyIds(): Promise<string[]>
}
