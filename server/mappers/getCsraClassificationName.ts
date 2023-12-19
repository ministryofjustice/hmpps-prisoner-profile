import { CsraAssessmentSummary } from '../interfaces/prisonApi/csraAssessmentSummary'

const getCsraClassificationName: Record<CsraAssessmentSummary['classificationCode'], string> = {
  LOW: 'Low',
  MED: 'Medium',
  STANDARD: 'Standard',
  HI: 'High',
}

export default (classificationCode?: CsraAssessmentSummary['classificationCode']): string =>
  classificationCode ? getCsraClassificationName[classificationCode] : 'Not entered'
