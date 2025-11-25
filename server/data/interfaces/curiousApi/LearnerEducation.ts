/**
 * Curious API types representing the data returned from the `/learnerEducation` API. This is a Curious 1 API
 *
 * The types in the Curious API do not have the most descriptive names. To facilitate future maintenance and syncing with
 * changes in the Curious API swagger spec, the types have been exported with names that make more sense to their use case.
 */

import type { LearnerEducationDTO, LearnerEducationPage } from 'curiousApiClient'

/**
 * `LearnerEductionPagedResponse` is an alias for the Curious API type `LearnerEducationPage`
 * `LearnerEductionPagedResponse` is a better name as it more accurately describes the fact that the data is part
 * of a paged response of Learner Education data from the Curious API.
 */
export type LearnerEductionPagedResponse = LearnerEducationPage

/**
 * `LearnerEduction` is an alias for the Curious API type `LearnerEducationDTO`
 * `LearnerEduction` represents a single educational course or qualification that a prisoner may undertake whilst in
 * prison.
 */
export type LearnerEducation = LearnerEducationDTO
