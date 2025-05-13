const imageInput = document.getElementById('file')
const inputContainer = document.getElementById('file-upload')
const previewImage = document.getElementById('preview-image')
const previewFilename = document.getElementById('preview-filename')
const previewContainer = document.getElementById('preview-container')
const changeLink = document.getElementById('change-photo-link')

// Show the image preview and hide upload controls when adding a new photo
function previewSelectedImage() {
  const file = imageInput.files[0]
  if (file) {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = function (e) {
      previewImage.src = e.target.result
      previewImage.alt = 'Preview of uploaded image'
      previewFilename.innerText = imageInput.files[0].name
      previewContainer.style.display = 'flex'
      inputContainer.style.display = 'none'
    }
  }
}

imageInput.addEventListener('change', previewSelectedImage)

// Hide the photo preview and show upload controls when 'change' link is clicked
function showUploadControls() {
  imageInput.value = null
  previewFilename.innerText = ''
  previewContainer.style.display = 'none'
  inputContainer.style.display = 'block'
}

changeLink.addEventListener('click', showUploadControls)
