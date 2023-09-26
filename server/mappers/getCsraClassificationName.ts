import { CsraAssessment } from '../interfaces/prisonApi/csraAssessment'

const getCsraClassificationName: Record<CsraAssessment['classificationCode'], string> = {
  LOW: 'Low',
  MED: 'Medium',
  STANDARD: 'Standard',
  HI: 'High',
}

export default (classificationCode?: CsraAssessment['classificationCode']): string =>
  classificationCode ? getCsraClassificationName[classificationCode] : 'Not entered'
