import { Validator } from '../middleware/validationMiddleware'
import HmppsError from '../interfaces/HmppsError'

// eslint-disable-next-line import/prefer-default-export
export const PrePostAppointmentValidator: Validator = (body: Record<string, string>) => {
  const errors: HmppsError[] = []

  if (body.bookingType === 'COURT' && !body.preAppointment) {
    errors.push({
      text: 'Select if a room is needed for the pre-court hearing briefing',
      href: '#preAppointment',
    })
  }

  if (body.preAppointment === 'yes' && !body.preAppointmentLocation) {
    errors.push({ text: 'Select a room for the pre-court hearing briefing', href: '#preAppointmentLocation' })
  }

  if (body.bookingType === 'COURT' && !body.postAppointment) {
    errors.push({
      text: 'Select if a room is needed for the post-court hearing briefing',
      href: '#postAppointment',
    })
  }

  if (body.postAppointment === 'yes' && !body.postAppointmentLocation) {
    errors.push({ text: 'Select a room for the post-court hearing briefing', href: '#postAppointmentLocation' })
  }

  if (!body.bookingType) {
    errors.push({ text: 'Select a booking type', href: '#bookingType' })
  }

  if (body.bookingType === 'COURT' && !body.court) {
    errors.push({ text: 'Select which court the hearing is for', href: '#court' })
  }

  if (body.bookingType === 'PROBATION' && !body.probationTeam) {
    errors.push({ text: 'Select which probation team the meeting is with', href: '#probationTeam' })
  }

  if (body.bookingType === 'COURT' && !body.hearingType) {
    errors.push({ text: 'Select the hearing type', href: '#hearingType' })
  }

  if (body.bookingType === 'PROBATION' && !body.meetingType) {
    errors.push({ text: 'Select the meeting type', href: '#meetingType' })
  }

  if (body.court === 'other' && !body.otherCourt) {
    errors.push({ text: 'Enter the name of the court', href: '#otherCourt' })
  }

  if (body.bookingType === 'COURT' && !body.cvpRequired) {
    errors.push({ text: 'Select if you know the court hearing link', href: '#cvpRequired' })
  }

  if (body.cvpRequired === 'yes' && !body.videoLinkUrl) {
    errors.push({ text: 'Enter the court hearing link', href: '#videoLinkUrl' })
  }

  if (body.cvpRequired === 'yes' && body.videoLinkUrl && body.videoLinkUrl.length > 120) {
    errors.push({
      text: 'Enter a court hearing link which is 120 characters or less',
      href: '#videoLinkUrl',
    })
  }

  return errors
}
