/**
 * Curious API types representing the data returned from the `/learnerEmployabilitySkills` API. This is a Curious 1 API
 *
 * The types in the Curious API do not have the most descriptive names. To facilitate future maintenance and syncing with
 * changes in the Curious API swagger spec, the types have been exported with names that make more sense to their use case.
 */

import type { EmployabilitySkillsPage } from 'curiousApiClient'

type LearnerEmployabilitySkills = EmployabilitySkillsPage
export default LearnerEmployabilitySkills
