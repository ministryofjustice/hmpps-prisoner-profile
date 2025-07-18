// Show the image preview and hide upload controls when adding a new photo
function previewSelectedImage(component) {
  const imageInput = component.querySelector('input[type="file"]')
  const inputContainer = component.querySelector('#file-upload')
  const previewImage = component.querySelector('#preview-image')
  const previewFilename = component.querySelector('#preview-filename')
  const previewContainer = component.querySelector('#preview-container')

  const file = imageInput.files[0]
  if (file) {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = function (e) {
      previewImage.src = e.target.result
      previewImage.alt = 'Preview of uploaded image'
      previewFilename.innerText = file.name
      previewContainer.style.display = 'flex'
      inputContainer.style.display = 'none'
    }
  }
}

// Hide the photo preview and show upload controls when 'change' link is clicked
function showUploadControls(component) {
  const imageInput = component.querySelector('input[type="file"]')
  const inputContainer = component.querySelector('#file-upload')
  const previewFilename = component.querySelector('#preview-filename')
  const previewContainer = component.querySelector('#preview-container')

  imageInput.value = null
  previewFilename.innerText = ''
  previewContainer.style.display = 'none'
  inputContainer.style.display = 'flex'
}

window.onload = () => {
  const components = document.querySelectorAll('[data-component="file-upload-with-preview-component"]')
  components.forEach(component => {
    const imageInput = component.querySelector('input[type="file"]')
    const changeLink = component.querySelector('#change-photo-link')
    imageInput.addEventListener('change', () => previewSelectedImage(component))
    changeLink.addEventListener('click', () => showUploadControls(component))
  })
}
