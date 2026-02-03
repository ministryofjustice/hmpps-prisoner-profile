export function fileUploadWithPreview() {
  const uploadComponents = document.querySelectorAll<HTMLDivElement>('.hmpps-file-upload-with-preview')
  uploadComponents.forEach(component => {
    const uploadContainer = component.querySelector<HTMLInputElement>('.govuk-file-upload')
    if (uploadContainer) {
      uploadContainer.addEventListener('change', () => {
        let uploadFile = uploadContainer.files[0]
        let uploadButton = component.querySelector<HTMLButtonElement>('.govuk-file-upload-button')
        let uploadButtonStatus = component.querySelector<HTMLSpanElement>('.govuk-file-upload-button__status')
        if (uploadFile && uploadButtonStatus) {
          const reader = new FileReader()
          reader.readAsDataURL(uploadFile)
          reader.onload = function (e) {
            uploadButtonStatus.innerText = uploadFile.name

            let previewContent = component.querySelector<HTMLDivElement>('.hmpps-file-upload-with-preview__content')
            if (!previewContent) {
              previewContent = document.createElement('div')
              previewContent.className = 'hmpps-file-upload-with-preview__content'
              while (uploadButton.firstChild) {
                previewContent.appendChild(uploadButton.firstChild)
              }
              uploadButton.appendChild(previewContent)
            }

            let previewThumbnail = component.querySelector<HTMLImageElement>('.hmpps-file-upload-with-preview__photo')
            if (!previewThumbnail) {
              previewThumbnail = document.createElement('img')
              previewThumbnail.className = 'hmpps-file-upload-with-preview__photo'
              uploadButton.insertBefore(previewThumbnail, previewContent)
            }

            if (previewThumbnail) {
              previewThumbnail.src = e.target.result as string
              previewThumbnail.alt = 'Uploaded image thumbnail'
            }

            uploadButton.style.display = 'flex'
            uploadButton.style.gap = '18px'
          }
        }
      })
    }
  })
}
