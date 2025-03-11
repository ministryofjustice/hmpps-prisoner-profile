import MulterFile from '../controllers/interfaces/MulterFile'

export interface FileUploadRequest {
  file?: Express.Multer.File
  files?: Record<string, MulterFile[]>
}

export function updatePhotoValidator(maxSizeMB: number, allowedMimeTypes: string[]) {
  const maxSize = maxSizeMB * 1024 * 1024

  return (req: FileUploadRequest) => {
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
}
