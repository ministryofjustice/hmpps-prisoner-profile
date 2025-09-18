import { PrePostAppointmentValidator } from './prePostAppointmentValidator'

describe('PrePostAppointment validation middleware', () => {
  const basicForm = {
    preAppointment: 'no',
    postAppointment: 'no',
    court: 'CODE',
    hearingType: 'APPEAL',
  }

  it('PASS - form with minimal data values', async () => {
    const vlbForm = {
      ...basicForm,
      cvpRequired: 'no',
      guestPinRequired: 'no',
    }

    const result = PrePostAppointmentValidator(vlbForm)

    expect(result).toEqual([])
  })

  it('PASS - form with full data values', async () => {
    const vlbForm = {
      ...basicForm,
      cvpRequired: 'yes',
      hmctsNumber: '1234',
      guestPinRequired: 'yes',
      guestPin: '1234',
    }

    const result = PrePostAppointmentValidator(vlbForm)

    expect(result).toEqual([])
  })

  it('FAIL - video link URL is > 120 characters', async () => {
    const vlbForm = {
      ...basicForm,
      cvpRequired: 'yes',
      videoLinkUrl: 'a'.repeat(121),
      guestPinRequired: 'no',
    }

    const result = PrePostAppointmentValidator(vlbForm)

    expect(result).toEqual([
      { text: 'Enter a court hearing link which is 120 characters or less', href: '#videoLinkUrl' },
    ])
  })

  it('FAIL - HMCTS number is > 8 characters', async () => {
    const vlbForm = {
      ...basicForm,
      cvpRequired: 'yes',
      hmctsNumber: '123456789',
      guestPinRequired: 'no',
    }

    const result = PrePostAppointmentValidator(vlbForm)

    expect(result).toEqual([{ text: 'Number from CVP address must be 8 characters or less', href: '#hmctsNumber' }])
  })

  it('FAIL - HMCTS number is non-numeric', async () => {
    const vlbForm = {
      ...basicForm,
      cvpRequired: 'yes',
      hmctsNumber: 'ABCD',
      guestPinRequired: 'no',
    }

    const result = PrePostAppointmentValidator(vlbForm)

    expect(result).toEqual([{ text: 'Number from CVP address must be a number, like 3457', href: '#hmctsNumber' }])
  })

  it('FAIL - Neither a HMCTS number or a video link URL is provided', async () => {
    const vlbForm = {
      ...basicForm,
      cvpRequired: 'yes',
      guestPinRequired: 'no',
    }

    const result = PrePostAppointmentValidator(vlbForm)

    expect(result).toEqual([
      { text: 'Enter number from CVP address or enter full web address (URL)', href: '#cvpRequired' },
    ])
  })

  it('FAIL - both a HMCTS number and a video link URL are mutually exclusive', async () => {
    const vlbForm = {
      ...basicForm,
      cvpRequired: 'yes',
      hmctsNumber: '1234',
      videoLinkUrl: 'URL',
      guestPinRequired: 'no',
    }

    const result = PrePostAppointmentValidator(vlbForm)

    expect(result).toEqual([
      { text: 'Enter number from CVP address or enter full web address (URL)', href: '#cvpRequired' },
    ])
  })

  it('FAIL - guest pin choice must be provided', async () => {
    const vlbForm = {
      ...basicForm,
      cvpRequired: 'no',
    }

    const result = PrePostAppointmentValidator(vlbForm)

    expect(result).toEqual([{ text: 'Select if you know the guest pin', href: '#guestPinRequired' }])
  })

  it('FAIL - guest pin must be provided if indicated', async () => {
    const vlbForm = {
      ...basicForm,
      cvpRequired: 'no',
      guestPinRequired: 'yes',
    }

    const result = PrePostAppointmentValidator(vlbForm)

    expect(result).toEqual([{ text: 'Enter the guest pin', href: '#guestPin' }])
  })

  it('FAIL - guest pin > 8 characters', async () => {
    const vlbForm = {
      ...basicForm,
      cvpRequired: 'no',
      guestPinRequired: 'yes',
      guestPin: '123456789',
    }

    const result = PrePostAppointmentValidator(vlbForm)

    expect(result).toEqual([{ text: 'Guest pin must be 8 characters are less', href: '#guestPin' }])
  })

  it('FAIL - guest pin must be a number', async () => {
    const vlbForm = {
      ...basicForm,
      cvpRequired: 'no',
      guestPinRequired: 'yes',
      guestPin: 'ABCD',
    }

    const result = PrePostAppointmentValidator(vlbForm)

    expect(result).toEqual([{ text: 'Guest pin must be a number, like 1344', href: '#guestPin' }])
  })
})
