/**
 * Interfaces defining Prison Service view model types.
 *
 * These types are a deliberate abstraction from the implementation detail of the REST API that returns the data
 * so as not to tightly couple the view concerns, including the controller, to any given REST API.
 */
export interface Prison {
  prisonId: string
  prisonName: string
}
