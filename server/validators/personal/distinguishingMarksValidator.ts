import {
  allBodyParts,
  bodyPartMap,
  bodyPartSelections,
} from '../../controllers/interfaces/distinguishingMarks/selectionTypes'

export interface BodySubmission {
  bodyPart?: string
}

interface BodySpecificSubmission {
  specificBodyPart?: string
  [key: string]: string
}

export interface FileUploadRequest {
  file?: Express.Multer.File
  body?: BodySpecificSubmission
}

// List of allowed MIME types
const allowedMimeTypes = ['image/jpeg', 'image/gif']

// Max file size in bytes (e.g. 200MB)
const maxSizeMB = 200
const maxSize = maxSizeMB * 1024 * 1024

export function newDistinguishingMarkValidator({ bodyPart }: BodySubmission) {
  const verifiedBodyPart = bodyPartSelections.find(selection => selection === bodyPartMap[bodyPart])
  if (!verifiedBodyPart) {
    return [{ text: 'Select a body part', href: '#body-part-selection' }]
  }

  return []
}

export function newDetailedDistinguishingMarkValidator(req: FileUploadRequest) {
  const verifiedBodyPart = allBodyParts.find(selection => selection === req.body.specificBodyPart)

  if (!verifiedBodyPart) {
    return [{ text: 'Select a body part', href: '#specific-body-part-selection' }]
  }

  const errors = []

  if (req.body[`description-${req.body.specificBodyPart}`]?.length > 240) {
    errors.push({
      text: 'The description must be 240 characters or less',
      href: `#description-${req.body.specificBodyPart}`,
    })
  }

  const fileName = `file`

  if (req.file?.size > maxSize) {
    errors.push({ text: `The photo file size must be less than ${maxSizeMB}MB`, href: `#${fileName}` })
  } else if (req.file && !allowedMimeTypes.includes(req.file.mimetype)) {
    const allowedTypes = allowedMimeTypes.map(type => type.split('/')[1].toUpperCase().replace('JPEG', 'JPG'))
    errors.push({
      text: `The photo must be a ${allowedTypes.slice(0, -1).join(', ')} or ${allowedTypes.slice(-1)}`,
      href: `#${fileName}`,
    })
  }

  return errors
}

export function updateLocationValidator(body: BodySpecificSubmission) {
  const verifiedBodyPart = allBodyParts.find(selection => selection === body.specificBodyPart)

  if (!verifiedBodyPart) {
    return [{ text: 'Select a body part', href: '#specific-body-part-selection' }]
  }

  return []
}

export function updateDescriptionValidator(body: BodySpecificSubmission) {
  if (body.description?.length > 240) {
    return [
      {
        text: 'The description must be 240 characters or less',
        href: `#description`,
      },
    ]
  }

  return []
}

export function updatePhotoValidator(req: FileUploadRequest) {
  if (!req.file) {
    return [{ text: 'Select a photo', href: '#file' }]
  }

  if (req.file.size > maxSize) {
    return [{ text: `The photo file size must be less than ${maxSizeMB}MB`, href: '#file' }]
  }

  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    const allowedTypes = allowedMimeTypes.map(type => type.split('/')[1].toUpperCase().replace('JPEG', 'JPG'))
    return [
      {
        text: `The photo must be a ${allowedTypes.slice(0, -1).join(', ')} or ${allowedTypes.slice(-1)}`,
        href: '#file',
      },
    ]
  }

  return []
}
