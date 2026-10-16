/**
 * A single prisoner's property totals, as returned by `GET /property-containers/prisoner/{prisonerNumber}/summary`.
 *
 * Counts are worked out for the prison the member of staff is viewing from (prisonId - their active caseload),
 * using the statuses the property service shows. Counts the containers held at that prison and how many are due
 * to transfer out, be returned or be disposed of; property held at other prisons and property due to transfer in
 * are only counted when the prisoner is held at that prison. When to show the card: only when the member of staff's
 * active caseload is in activeAgencies on /info; then when prisonerHeldHere is true or heldAtThisPrison is above 0,
 * however the prisoner was found (including global search, and prisoners in transit or released). Otherwise the
 * prison holds nothing for this person and no card is shown.
 */
export interface PrisonerPropertySummary {
  /** The prison the counts are worked out for: the member of staff's active caseload */
  prisonId: string

  /** The viewing prison's name (prison-register), or null if unknown */
  prisonName: string

  /** Whether the prisoner is currently held at the viewing prison */
  prisonerHeldHere: boolean

  /** The prisoner's current establishment id (prisoner-search), or null if they are released or in transit */
  currentEstablishmentId: string | null

  /** The prisoner's current establishment name (prison-register), or null if unknown, released or in transit */
  currentEstablishmentName: string | null

  /** Active containers held at the viewing prison */
  heldAtThisPrison: number

  /**
   * Containers held at the viewing prison that are due to transfer out, because their
   * owner has moved on or is in transit
   */
  dueForTransferOut: number

  /**
   * Containers held at the viewing prison that are due to be returned, because their
   * owner has been released or is about to be
   */
  dueToBeReturned: number

  /** Containers held at the viewing prison whose proposed disposal date has arisen (today or earlier) */
  dueToBeDisposed: number

  /**
   * Active containers held at other prisons. Only counted when the prisoner is held at the viewing prison,
   * otherwise 0.
   */
  heldAtOtherPrisons: number

  /**
   * Containers due to transfer in to the viewing prison: those held at other prisons that now need to
   * follow the prisoner here, plus any already sent here and not yet logged on arrival. Only counted
   * when the prisoner is held at the viewing prison, otherwise 0.
   */
  dueForTransferIn: number
}

export interface PrisonerPropertyApiClient {
  getPrisonerPropertySummary(prisonId: string, prisonerNumber: string): Promise<PrisonerPropertySummary>
}
