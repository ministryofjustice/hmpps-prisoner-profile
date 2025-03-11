import MulterFile from '../controllers/interfaces/MulterFile'
import { fileUploadValidator } from './fileUploadValidator'

describe('fileUploadValidator', () => {
  it('Valid photo', () => {
    const req = {
      file: { size: 100, mimetype: 'image/jpeg' } as MulterFile,
    }
    const errors = fileUploadValidator(200, ['image/jpeg', 'image/gif'])(req)
    expect(errors.length).toEqual(0)
  })

  it('No photo selected', () => {
    const req = {}
    const errors = fileUploadValidator(200, ['image/jpeg', 'image/gif'])(req)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('Select a photo')
    expect(errors[0].href).toEqual('#file')
  })

  it('File size too large', () => {
    const req = {
      file: { size: 201 * 1024 * 1024, mimetype: 'image/jpeg' } as MulterFile,
    }
    const errors = fileUploadValidator(200, ['image/jpeg', 'image/gif'])(req)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('The photo file size must be less than 200MB')
    expect(errors[0].href).toEqual('#file')
  })

  it('Invalid MIME type', () => {
    const req = {
      file: { size: 100, mimetype: 'image/png' } as MulterFile,
    }
    const errors = fileUploadValidator(200, ['image/jpeg', 'image/gif'])(req)
    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('The photo must be a JPG or GIF')
    expect(errors[0].href).toEqual('#file')
  })
})
