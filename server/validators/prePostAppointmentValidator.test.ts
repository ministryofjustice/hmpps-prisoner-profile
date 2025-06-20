import { PrePostAppointmentValidator } from './prePostAppointmentValidator'
import config from '../config'

describe('PrePostAppointment validation middleware', () => {
  describe('Validation - bvlsHmctsLinkAndGuestPin feature OFF', () => {
    // Set feature flag off here
    beforeEach(() => {
      config.featureToggles.bvlsHmctsLinkGuestPinEnabled = false
    })

    it('PASS - validation with good data', async () => {
      const vlbForm = {
        preAppointment: 'no',
        postAppointment: 'no',
        court: 'CODE',
        hearingType: 'APPEAL',
        cvpRequired: 'no',
      }

      const result = PrePostAppointmentValidator(vlbForm)

      expect(result).toEqual([])
    })

    it('FAIL - validation with no data', async () => {
      const vlbForm = {
        preAppointment: '',
        postAppointment: '',
        court: '',
        hearingType: '',
        cvpRequired: '',
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

    it('FAIL - validation with missing locations', async () => {
      const vlbForm = {
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

    it('FAIL - validation for a missing video link URL', async () => {
      const vlbForm = {
        preAppointment: 'no',
        postAppointment: 'no',
        court: 'CODE',
        hearingType: 'APPEAL',
        cvpRequired: 'yes',
      }

      const result = PrePostAppointmentValidator(vlbForm)

      expect(result).toEqual([{ text: 'Enter the court hearing link', href: '#videoLinkUrl' }])
    })

    it('FAIL - fail validation for a video link URL which is too long', async () => {
      const vlbForm = {
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
  })

  describe('Validation - bvlsHmctsLinkAndGuestPin feature ON', () => {
    // Set feature flag on here
    beforeEach(() => {
      config.featureToggles.bvlsHmctsLinkGuestPinEnabled = true
    })

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
})
