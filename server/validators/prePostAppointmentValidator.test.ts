import { PrePostAppointmentValidator } from './prePostAppointmentValidator'
import config from '../config'

describe('Validation middleware', () => {
  beforeEach(() => {
    config.featureToggles.bookAVideoLinkEnabled = false
  })

  it('should pass validation with good data', async () => {
    const vlbForm = {
      preAppointment: 'no',
      postAppointment: 'no',
      court: 'CODE',
    }

    const result = PrePostAppointmentValidator(vlbForm)

    expect(result).toEqual([])
  })

  it('should fail validation when hearing type is missing', async () => {
    config.featureToggles.bookAVideoLinkEnabled = true

    const vlbForm = {
      preAppointment: 'no',
      postAppointment: 'no',
      court: 'CODE',
    }

    const result = PrePostAppointmentValidator(vlbForm)

    expect(result).toEqual([{ text: 'Select the hearing type', href: '#hearingType' }])
  })

  it('should fail validation with no data', async () => {
    const vlbForm = {
      preAppointment: '',
      postAppointment: '',
      court: '',
    }

    const result = PrePostAppointmentValidator(vlbForm)

    expect(result).toEqual([
      { text: 'Select if a room is needed for the pre-court hearing briefing', href: '#preAppointment' },
      { text: 'Select if a room is needed for the post-court hearing briefing', href: '#postAppointment' },
      { text: 'Select which court the hearing is for', href: '#court' },
    ])
  })

  it('should fail validation with missing locations', async () => {
    const vlbForm = {
      preAppointment: 'yes',
      preAppointmentLocation: '',
      postAppointment: 'yes',
      postAppointmentLocation: '',
      court: 'CODE',
    }

    const result = PrePostAppointmentValidator(vlbForm)

    expect(result).toEqual([
      { text: 'Select a room for the pre-court hearing briefing', href: '#preAppointmentLocation' },
      { text: 'Select a room for the post-court hearing briefing', href: '#postAppointmentLocation' },
    ])
  })

  it('should fail validation with missing court name', async () => {
    const vlbForm = {
      preAppointment: 'no',
      postAppointment: 'no',
      court: 'other',
      otherCourt: '',
    }

    const result = PrePostAppointmentValidator(vlbForm)

    expect(result).toEqual([{ text: 'Enter the name of the court', href: '#otherCourt' }])
  })

  it('should fail validation for a video link URL which is too long', async () => {
    const vlbForm = {
      preAppointment: 'no',
      postAppointment: 'no',
      court: 'CODE',
      videoLinkUrl: 'a'.repeat(121),
    }

    const result = PrePostAppointmentValidator(vlbForm)

    expect(result).toEqual([
      { text: 'Enter a court hearing link which is 120 characters or less', href: '#videoLinkUrl' },
    ])
  })
})
