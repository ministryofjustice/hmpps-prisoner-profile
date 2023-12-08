import { formatDate } from '../utils/dateHelpers'

import { CsraAssessment } from '../interfaces/prisonApi/csraAssessment'
import { formatName } from '../utils/utils'
import { StaffDetails } from '../interfaces/prisonApi/staffDetails'
import getCsraClassificationName from './getCsraClassificationName'
import { Agency } from '../interfaces/prisonApi/agency'

export default (csraAssessment: CsraAssessment, agencyDetails: Agency | null, staffDetails: StaffDetails | null) => {
  const assessorAuthority = csraAssessment.assessmentCommitteeName || 'Not entered'
  const assessorName = formatName(staffDetails?.firstName, '', staffDetails?.lastName)
  return [
    {
      key: { text: 'CSRA' },
      value: {
        text: csraAssessment.originalClassificationCode
          ? `${getCsraClassificationName(
              csraAssessment.classificationCode,
            )} - this is an override from ${getCsraClassificationName(csraAssessment.originalClassificationCode)}`
          : getCsraClassificationName(csraAssessment.classificationCode),
      },
    },
    ...(csraAssessment.originalClassificationCode
      ? [
          {
            key: { text: 'Override reason' },
            value: { text: csraAssessment.classificationReviewReason || 'Not entered' },
          },
        ]
      : []),
    ...(csraAssessment.approvalCommitteeName
      ? [
          {
            key: { text: 'Authorised by' },
            value: { text: csraAssessment.approvalCommitteeName },
          },
        ]
      : []),
    {
      key: { text: 'Location', classes: 'govuk-!-padding-top-6' },
      value: { text: agencyDetails?.description || 'Not entered' },
    },
    {
      key: { text: 'Comments' },
      value: { text: csraAssessment.assessmentComment || 'Not entered' },
    },
    {
      key: { text: 'Reviewed by' },
      value: { text: `${assessorAuthority} - ${assessorName || 'Not entered'}` },
    },
    {
      key: { text: 'Next review date' },
      value: {
        text: csraAssessment.nextReviewDate ? formatDate(csraAssessment.nextReviewDate, 'long') : 'Not entered',
      },
    },
  ]
}
