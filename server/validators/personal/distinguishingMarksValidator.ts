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

export interface FileUploadRequest extends Request {
  file?: Express.Multer.File
}

// List of allowed MIME types
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

// Max file size in bytes (e.g., 5MB)
const maxSizeMB = 10
const maxSize = maxSizeMB * 1024 * 1024

export function newDistinguishingMarkValidator({ bodyPart }: BodySubmission) {
  const verifiedBodyPart = bodyPartSelections.find(selection => selection === bodyPartMap[bodyPart])
  if (!verifiedBodyPart) {
    return [{ text: 'Select a body part' }]
  }

  return []
}

export function newDetailedDistinguishingMarkValidator(body: BodySpecificSubmission) {
  const verifiedBodyPart = allBodyParts.find(selection => selection === body.specificBodyPart)

  if (!verifiedBodyPart) {
    return [{ text: 'Select a body part', href: '#specific-body-part-selection' }]
  }

  if (body[`description-${body.specificBodyPart}`].length > 240) {
    return [
      {
        text: 'The description must be 240 characters or less',
        href: `#description-${body.specificBodyPart}`,
      },
    ]
  }

  return []
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
    return [{ text: `The selected file must be smaller than ${maxSizeMB}MB`, href: '#file' }]
  }

  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    const allowedTypes = allowedMimeTypes.map(type => type.split('/')[1].toUpperCase())
    return [
      {
        text: `The selected file must be a ${allowedTypes.slice(0, -1).join(', ')} or ${allowedTypes.slice(-1)}`,
        href: '#file',
      },
    ]
  }

  return []
}
