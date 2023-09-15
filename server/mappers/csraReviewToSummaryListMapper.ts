import { formatDate } from '../utils/dateHelpers'

import { CsraAssessment } from '../interfaces/prisonApi/csraAssessment'
import { AgencyLocationDetails } from '../interfaces/prisonApi/agencies'
import { formatName } from '../utils/utils'
import { StaffDetails } from '../interfaces/prisonApi/staffDetails'

const csraTranslations = {
  LOW: 'Low',
  MED: 'Medium',
  STANDARD: 'Standard',
  HI: 'High',
}
export default (
  csraAssessment: CsraAssessment,
  agencyDetails: AgencyLocationDetails | null,
  staffDetails: StaffDetails | null,
) => {
  const assessorAuthority = csraAssessment.assessmentCommitteeName || 'Not entered'
  const assessorName = formatName(staffDetails?.firstName, '', staffDetails?.lastName)

  return [
    {
      key: { text: 'CSRA' },
      value: {
        text: csraAssessment.originalClassificationCode
          ? `${csraTranslations[csraAssessment.classificationCode]} - this is an override from ${
              csraTranslations[csraAssessment.originalClassificationCode]
            }`
          : csraTranslations[csraAssessment.classificationCode],
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
        text: formatDate(new Date(csraAssessment.nextReviewDate).toISOString(), 'long'),
      },
    },
  ]
}
