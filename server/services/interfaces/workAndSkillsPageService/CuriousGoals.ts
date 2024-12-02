import GovSummaryItem from '../../../interfaces/GovSummaryItem'

/**
 * Interfaces defining Curious Goal view model types.
 *
 * These types are a deliberate abstraction from the implementation detail of the REST API that returns the data
 * so as not to tightly couple the view concerns, including the controller, to any given REST API.*
 */
export default interface CuriousGoals {
  prisonerNumber: string
  employmentGoals: Array<GovSummaryItem>
  personalGoals: Array<GovSummaryItem>
  longTermGoals: Array<GovSummaryItem>
  shortTermGoals: Array<GovSummaryItem>
}
