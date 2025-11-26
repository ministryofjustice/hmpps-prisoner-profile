/**
 * Interfaces defining Curious Assessment types.
 *
 * These types are a deliberate abstraction from the implementation detail of the REST API that returns the data
 * so as not to tightly couple the view concerns, including the controller, to any given REST API.
 */

/**
 * A prisoner's Functional Skills, which is made up of a collection of Assessments.
 */
export interface FunctionalSkills {
  assessments: Array<Assessment>
}

/**
 * An Assessment of a single functional skill.
 */
export interface Assessment {
  prisonId: string
  type: 'ENGLISH' | 'MATHS' | 'DIGITAL_LITERACY' | 'READING' | 'ESOL'
  assessmentDate: Date
  level: string
  levelBanding: string | null
  referral: Array<string> | null
  nextStep: string | null
  source: 'CURIOUS1' | 'CURIOUS2'
}
