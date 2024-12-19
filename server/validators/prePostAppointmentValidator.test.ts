import { PrePostAppointmentValidator } from './prePostAppointmentValidator'

describe('Validation middleware', () => {
  it('should pass validation with good data', async () => {
    const vlbForm = {
      bookingType: 'COURT',
      preAppointment: 'no',
      postAppointment: 'no',
      court: 'CODE',
      hearingType: 'APPEAL',
      cvpRequired: 'no',
    }

    const result = PrePostAppointmentValidator(vlbForm)

    expect(result).toEqual([])
  })

  it('should fail validation with no data', async () => {
    const vlbForm = {
      bookingType: 'COURT',
      preAppointment: '',
      postAppointment: '',
      court: '',
    }

    const result = PrePostAppointmentValidator(vlbForm)

    expect(result).toEqual([
      { text: 'Select if a room is needed for the pre-court hearing briefing', href: '#preAppointment' },
      { text: 'Select if a room is needed for the post-court hearing briefing', href: '#postAppointment' },
      { text: 'Select which court the hearing is for', href: '#court' },
      { text: 'Select the hearing type', href: '#hearingType' },
      { text: 'Select if you know the court hearing link', href: '#cvpRequired' },
    ])
  })

  it('should fail validation with missing locations', async () => {
    const vlbForm = {
      bookingType: 'COURT',
      preAppointment: 'yes',
      preAppointmentLocation: '',
      postAppointment: 'yes',
      postAppointmentLocation: '',
      court: 'CODE',
      hearingType: 'APPEAL',
      cvpRequired: 'no',
    }

    const result = PrePostAppointmentValidator(vlbForm)

    expect(result).toEqual([
      { text: 'Select a room for the pre-court hearing briefing', href: '#preAppointmentLocation' },
      { text: 'Select a room for the post-court hearing briefing', href: '#postAppointmentLocation' },
    ])
  })

  it('should fail validation with missing court name', async () => {
    const vlbForm = {
      bookingType: 'COURT',
      preAppointment: 'no',
      postAppointment: 'no',
      court: 'other',
      otherCourt: '',
      hearingType: 'APPEAL',
      cvpRequired: 'no',
    }

    const result = PrePostAppointmentValidator(vlbForm)

    expect(result).toEqual([{ text: 'Enter the name of the court', href: '#otherCourt' }])
  })

  it('should fail validation for a missing video link URL', async () => {
    const vlbForm = {
      bookingType: 'COURT',
      preAppointment: 'no',
      postAppointment: 'no',
      court: 'CODE',
      hearingType: 'APPEAL',
      cvpRequired: 'yes',
    }

    const result = PrePostAppointmentValidator(vlbForm)

    expect(result).toEqual([{ text: 'Enter the court hearing link', href: '#videoLinkUrl' }])
  })

  it('should fail validation for a video link URL which is too long', async () => {
    const vlbForm = {
      bookingType: 'COURT',
      preAppointment: 'no',
      postAppointment: 'no',
      court: 'CODE',
      hearingType: 'APPEAL',
      cvpRequired: 'yes',
      videoLinkUrl: 'a'.repeat(121),
    }

    const result = PrePostAppointmentValidator(vlbForm)

    expect(result).toEqual([
      { text: 'Enter a court hearing link which is 120 characters or less', href: '#videoLinkUrl' },
    ])
  })

  it('should fail validation for meeting type and probation team missing', async () => {
    const vlbForm = {
      bookingType: 'PROBATION',
      probationTeam: '',
      meetingType: '',
    }

    const result = PrePostAppointmentValidator(vlbForm)

    expect(result).toEqual([
      {
        href: '#probationTeam',
        text: 'Select which probation team the meeting is with',
      },
      {
        href: '#meetingType',
        text: 'Select the meeting type',
      },
    ])
  })
})
