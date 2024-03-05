import { formatDate } from '../utils/dateHelpers'

import CsraAssessment, { ClassificationCode } from '../data/interfaces/prisonApi/CsraAssessment'
import { formatName } from '../utils/utils'
import StaffDetails from '../data/interfaces/prisonApi/StaffDetails'
import getCsraClassificationName from './getCsraClassificationName'
import Agency from '../data/interfaces/prisonApi/Agency'

function approvedResultText(
  originalClassificationCode: ClassificationCode,
  approvedClassificationCode: ClassificationCode,
) {
  if (originalClassificationCode && originalClassificationCode !== approvedClassificationCode) {
    return `${getCsraClassificationName(
      approvedClassificationCode,
    )} - this is an override from ${getCsraClassificationName(originalClassificationCode)}`
  }
  return getCsraClassificationName(approvedClassificationCode)
}

function summaryRow(key: string, value: string, keyClasses = '') {
  if (keyClasses) {
    return { key: { text: key, classes: keyClasses }, value: { text: value } }
  }

  return { key: { text: key }, value: { text: value } }
}

function approvalRows(csraAssessment: CsraAssessment) {
  if (csraAssessment.approvedClassificationCode) {
    return [
      summaryRow(
        'Approved result',
        approvedResultText(csraAssessment.originalClassificationCode, csraAssessment.approvedClassificationCode),
      ),
      summaryRow('Approval comments', csraAssessment.approvalComment || 'No approval comments entered'),
      summaryRow('Approved by', csraAssessment.approvalCommitteeName || 'Not entered'),
      summaryRow(
        'Approval date',
        csraAssessment.approvalDate ? formatDate(csraAssessment.approvalDate, 'long') : 'Not entered',
      ),
    ]
  }
  return []
}

function overrideRows(csraAssessment: CsraAssessment) {
  if (csraAssessment.overridingClassificationCode) {
    return [
      summaryRow('Override result', getCsraClassificationName(csraAssessment.overridingClassificationCode)),
      summaryRow('Override reason', csraAssessment.overrideReason || 'Not entered'),
    ]
  }
  return []
}

export default (csraAssessment: CsraAssessment, agencyDetails: Agency | null, staffDetails: StaffDetails | null) => {
  const assessorAuthority = csraAssessment.assessmentCommitteeName || 'Not entered'
  const assessorName = formatName(staffDetails?.firstName, '', staffDetails?.lastName)
  return [
    ...approvalRows(csraAssessment),
    summaryRow(
      'Assessment comments',
      csraAssessment.assessmentComment || 'No assessment comment entered',
      csraAssessment.approvalDate ? 'govuk-!-padding-top-6' : '',
    ),
    summaryRow(
      'Calculated result',
      csraAssessment.calculatedClassificationCode
        ? getCsraClassificationName(csraAssessment.calculatedClassificationCode)
        : 'Not entered',
    ),
    ...overrideRows(csraAssessment),
    {
      key: { text: 'Location' },
      value: { text: agencyDetails?.description || 'Not entered' },
    },
    {
      key: { text: 'Assessed by' },
      value: { text: `${assessorAuthority} - ${assessorName || 'Not entered'}` },
    },
    summaryRow(
      'Next review date',
      csraAssessment.nextReviewDate ? formatDate(csraAssessment.nextReviewDate, 'long') : 'Not entered',
      'govuk-!-padding-top-6',
    ),
  ]
}
