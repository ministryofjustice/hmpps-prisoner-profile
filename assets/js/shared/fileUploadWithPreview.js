export function fileUploadWithPreview() {
  const uploadComponents = document.querySelectorAll('.hmpps-file-upload-with-preview')
  uploadComponents.forEach(component => {
    let uploadContainer = component.querySelector('.govuk-file-upload')
    if (uploadContainer) {
      uploadContainer.addEventListener('change', () => {
        let uploadFile = uploadContainer.files[0]
        let uploadButton = component.querySelector('.govuk-file-upload-button')
        let uploadButtonStatus = component.querySelector('.govuk-file-upload-button__status')
        if (uploadFile && uploadButtonStatus) {
          const reader = new FileReader()
          reader.readAsDataURL(uploadFile)
          reader.onload = function (e) {
            uploadButtonStatus.innerText = uploadFile.name

            let previewContent = component.querySelector('.hmpps-file-upload-with-preview__content')
            if (!previewContent) {
              previewContent = document.createElement('div')
              previewContent.className = 'hmpps-file-upload-with-preview__content'
              while (uploadButton.firstChild) {
                previewContent.appendChild(uploadButton.firstChild)
              }
              uploadButton.appendChild(previewContent)
            }

            let previewThumbnail = component.querySelector('.hmpps-file-upload-with-preview__photo')
            if (!previewThumbnail) {
              previewThumbnail = document.createElement('img')
              previewThumbnail.className = 'hmpps-file-upload-with-preview__photo'
              uploadButton.insertBefore(previewThumbnail, previewContent)
            }

            if (previewThumbnail) {
              previewThumbnail.src = e.target.result
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
