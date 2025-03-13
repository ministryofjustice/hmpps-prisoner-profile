// Show the image preview and hide upload controls when adding a new distinguishing mark photo

const imageInput = document.getElementById('file')
const inputContainer = document.getElementById('mark-add-photo-upload-control')
const previewImage = document.getElementById('mark-image-preview')
const previewFilename = document.getElementById('mark-image-filename')
const previewContainer = document.getElementById('mark-preview-image-container')

function previewSelectedImage() {
  const file = imageInput.files[0]
  if (file) {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = function(e) {
      previewImage.src = e.target.result
      previewImage.alt = 'Preview of uploaded image'
      previewFilename.innerText=imageInput.files[0].name
      previewContainer.style.display = 'flex'
      inputContainer.style.display = 'none'
    }
  }
}
imageInput.addEventListener('change', previewSelectedImage)

// Hide the photo preview and show upload controls when 'change' link is clicked
const changeLink = document.getElementById('change-photo-link')

function showUploadControls() {
  imageInput.value = null
  previewFilename.innerText=''
  previewContainer.style.display = 'none'
  inputContainer.style.display = 'block'
}
changeLink.addEventListener('click', showUploadControls)
