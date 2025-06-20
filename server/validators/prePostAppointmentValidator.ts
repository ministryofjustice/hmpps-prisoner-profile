import { Validator } from '../middleware/validationMiddleware'
import HmppsError from '../interfaces/HmppsError'
import { bvlsHmctsLinkGuestPinEnabled } from '../utils/featureToggles'

// eslint-disable-next-line import/prefer-default-export
export const PrePostAppointmentValidator: Validator = (body: Record<string, string>) => {
  const errors: HmppsError[] = []

  const containsOnlyDigits = (val: string) => {
    return /^\d+$/.test(val)
  }

  if (!body.preAppointment) {
    errors.push({
      text: 'Select if a room is needed for the pre-court hearing briefing',
      href: '#preAppointment',
    })
  }

  if (body.preAppointment === 'yes' && !body.preAppointmentLocation) {
    errors.push({ text: 'Select a room for the pre-court hearing briefing', href: '#preAppointmentLocation' })
  }

  if (!body.postAppointment) {
    errors.push({
      text: 'Select if a room is needed for the post-court hearing briefing',
      href: '#postAppointment',
    })
  }

  if (body.postAppointment === 'yes' && !body.postAppointmentLocation) {
    errors.push({ text: 'Select a room for the post-court hearing briefing', href: '#postAppointmentLocation' })
  }

  if (!body.court) {
    errors.push({ text: 'Select which court the hearing is for', href: '#court' })
  }

  if (!body.hearingType) {
    errors.push({ text: 'Select the hearing type', href: '#hearingType' })
  }

  if (bvlsHmctsLinkGuestPinEnabled()) {
    // Feature switch is ON - validate new fields

    if (!body.cvpRequired) {
      errors.push({ text: 'Enter number from CVP address or enter full web address (URL)', href: '#cvpRequired' })
    }

    if (
      body.cvpRequired === 'yes' &&
      ((!body.videoLinkUrl && !body.hmctsNumber) || (body.videoLinkUrl && body.hmctsNumber))
    ) {
      errors.push({ text: 'Enter number from CVP address or enter full web address (URL)', href: '#cvpRequired' })
    }

    if (body.cvpRequired === 'yes' && body.videoLinkUrl && body.videoLinkUrl.length > 120) {
      errors.push({
        text: 'Enter a court hearing link which is 120 characters or less',
        href: '#videoLinkUrl',
      })
    }

    if (body.cvpRequired === 'yes' && body.hmctsNumber && body.hmctsNumber.length > 8) {
      errors.push({
        text: 'Number from CVP address must be 8 characters or less',
        href: '#hmctsNumber',
      })
    }

    if (body.cvpRequired === 'yes' && body.hmctsNumber && !containsOnlyDigits(body.hmctsNumber)) {
      errors.push({
        text: 'Number from CVP address must be a number, like 3457',
        href: '#hmctsNumber',
      })
    }

    if (!body.guestPinRequired) {
      errors.push({
        text: 'Select if you know the guest pin',
        href: '#guestPinRequired',
      })
    }

    if (body.guestPinRequired === 'yes' && !body.guestPin) {
      errors.push({
        text: 'Enter the guest pin',
        href: '#guestPin',
      })
    }

    if (body.guestPinRequired === 'yes' && body.guestPin && body.guestPin.length > 8) {
      errors.push({
        text: 'Guest pin must be 8 characters are less',
        href: '#guestPin',
      })
    }

    if (body.guestPinRequired === 'yes' && body.guestPin && !containsOnlyDigits(body.guestPin)) {
      errors.push({
        text: 'Guest pin must be a number, like 1344',
        href: '#guestPin',
      })
    }
  } else {
    // Feature switch is OFF - current behaviour

    if (!body.cvpRequired) {
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
  }

  return errors
}
