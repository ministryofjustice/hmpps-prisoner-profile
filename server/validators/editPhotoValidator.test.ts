import MulterFile from '../controllers/interfaces/MulterFile'
import { editPhotoValidator } from './editPhotoValidator'

describe('editPhotoValidator', () => {
  describe('Upload options', () => {
    it('Requires an option to be selected', () => {
      const req = {
        body: {},
      }
      const errors = editPhotoValidator(req)
      expect(errors[0].text).toEqual('Select the type of facial image to use')
      expect(errors[0].href).toEqual('#photoType')
    })
  })

  describe('With new photo', () => {
    const body = { photoType: 'upload' }

    it('Valid photo', () => {
      const req = {
        body,
        file: { size: 100, mimetype: 'image/jpeg' } as MulterFile,
      }
      const errors = editPhotoValidator(req)
      expect(errors.length).toEqual(0)
    })

    it('No photo selected', () => {
      const req = { body }
      const errors = editPhotoValidator(req)
      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual('Select a photo')
      expect(errors[0].href).toEqual('#file')
    })

    it('File size too large', () => {
      const req = {
        body,
        file: { size: 201 * 1024 * 1024, mimetype: 'image/jpeg' } as MulterFile,
      }
      const errors = editPhotoValidator(req)
      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual('The photo file size must be less than 200MB')
      expect(errors[0].href).toEqual('#file')
    })

    it('Invalid MIME type', () => {
      const req = {
        body,
        file: { size: 100, mimetype: 'image/png' } as MulterFile,
      }
      const errors = editPhotoValidator(req)
      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual('The photo must be a JPG or GIF')
      expect(errors[0].href).toEqual('#file')
    })
  })
})
