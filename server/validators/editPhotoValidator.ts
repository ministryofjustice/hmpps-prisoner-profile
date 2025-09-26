import { FileUploadRequest, fileUploadValidator } from './fileUploadValidator'

export function editPhotoValidator(req: FileUploadRequest & { body?: { photoType?: string } }) {
  const photoType = req.body?.photoType
  const errors = []

  if (!photoType) {
    errors.push({ text: 'Select the type of facial image to use', href: '#photoType' })
  } else if (photoType === 'upload') {
    errors.push(...fileUploadValidator(200, ['image/jpeg', 'image/gif'])(req))
  }

  return errors
}

export default { editPhotoValidator }
