import {
  newDetailedDistinguishingMarkValidator,
  newDistinguishingMarkValidator,
  updateDescriptionValidator,
  updateLocationValidator,
  updatePhotoValidator,
} from './distinguishingMarksValidator'
import { allBodyParts } from '../../controllers/interfaces/distinguishingMarks/selectionTypes'
import MulterFile from '../../controllers/interfaces/MulterFile'

describe('Distinguishing Marks Validators', () => {
  describe('newDistinguishingMarkValidator', () => {
    it.each([{ bodyPart: 'face' }, { bodyPart: 'right-arm' }])('Valid body part: %s', ({ bodyPart }) => {
      const errors = newDistinguishingMarkValidator({ bodyPart })
      expect(errors.length).toEqual(0)
    })

    it.each([{ bodyPart: 'invalid-part' }, { bodyPart: '' }])('Invalid body part: %s', ({ bodyPart }) => {
      const errors = newDistinguishingMarkValidator({ bodyPart })
      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual('Select a body part')
      expect(errors[0].href).toEqual('#body-part-selection')
    })
  })

  describe('newDetailedDistinguishingMarkValidator', () => {
    it.each(allBodyParts.map(part => ({ specificBodyPart: part, description: 'Valid description' })))(
      'Valid body part and description: %s',
      ({ specificBodyPart, description }) => {
        const req = {
          body: { [`description-${specificBodyPart}`]: description, specificBodyPart },
        }
        const errors = newDetailedDistinguishingMarkValidator(req)
        expect(errors.length).toEqual(0)
      },
    )

    it('Invalid body part', () => {
      const req = {
        body: { 'description-invalid-part': 'Valid description', specificBodyPart: 'invalid-part' },
      }
      const errors = newDetailedDistinguishingMarkValidator(req)
      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual('Select a body part')
      expect(errors[0].href).toEqual('#specific-body-part-selection')
    })

    it('Description too long', () => {
      const req = {
        body: { 'description-face': 'a'.repeat(241), specificBodyPart: 'face' },
      }
      const errors = newDetailedDistinguishingMarkValidator(req)
      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual('The description must be 240 characters or less')
      expect(errors[0].href).toEqual('#description-face')
    })

    it('File size too large', () => {
      const req = {
        body: { specificBodyPart: 'face' },
        files: { 'file-face': [{ size: 201 * 1024 * 1024 }] as MulterFile[] },
      }
      const errors = newDetailedDistinguishingMarkValidator(req)
      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual('The photo file size must be less than 200MB')
      expect(errors[0].href).toEqual('#file-face')
    })

    it('Invalid MIME type', () => {
      const req = {
        body: { specificBodyPart: 'face' },
        files: { 'file-face': [{ size: 100, mimetype: 'image/png' } as MulterFile] },
      }
      const errors = newDetailedDistinguishingMarkValidator(req)
      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual('The photo must be a JPG or GIF')
      expect(errors[0].href).toEqual('#file-face')
    })
  })

  describe('updateLocationValidator', () => {
    it.each(allBodyParts.map(part => ({ specificBodyPart: part })))('Valid body part: %s', ({ specificBodyPart }) => {
      const errors = updateLocationValidator({ specificBodyPart })
      expect(errors.length).toEqual(0)
    })

    it('Invalid body part', () => {
      const errors = updateLocationValidator({ specificBodyPart: 'invalid-part' })
      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual('Select a body part')
      expect(errors[0].href).toEqual('#specific-body-part-selection')
    })
  })

  describe('updateDescriptionValidator', () => {
    it('Valid description', () => {
      const errors = updateDescriptionValidator({ description: 'Valid description' })
      expect(errors.length).toEqual(0)
    })

    it('Description too long', () => {
      const errors = updateDescriptionValidator({ description: 'a'.repeat(241) })
      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual('The description must be 240 characters or less')
      expect(errors[0].href).toEqual('#description')
    })
  })

  describe('updatePhotoValidator', () => {
    it('Valid photo', () => {
      const req = {
        file: { size: 100, mimetype: 'image/jpeg' } as MulterFile,
      }
      const errors = updatePhotoValidator(req)
      expect(errors.length).toEqual(0)
    })

    it('No photo selected', () => {
      const req = {}
      const errors = updatePhotoValidator(req)
      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual('Select a photo')
      expect(errors[0].href).toEqual('#file')
    })

    it('File size too large', () => {
      const req = {
        file: { size: 201 * 1024 * 1024, mimetype: 'image/jpeg' } as MulterFile,
      }
      const errors = updatePhotoValidator(req)
      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual('The photo file size must be less than 200MB')
      expect(errors[0].href).toEqual('#file')
    })

    it('Invalid MIME type', () => {
      const req = {
        file: { size: 100, mimetype: 'image/png' } as MulterFile,
      }
      const errors = updatePhotoValidator(req)
      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual('The photo must be a JPG or GIF')
      expect(errors[0].href).toEqual('#file')
    })
  })
})
