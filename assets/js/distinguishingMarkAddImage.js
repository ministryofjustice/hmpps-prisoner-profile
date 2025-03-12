// Show the image preview and hide upload controls when adding a new distinguishing mark photo

const imageInput = document.getElementById('file')
const inputContainer = document.getElementById('mark-add-photo-upload-control')
const previewImage = document.getElementById('mark-image-preview')
const previewFilename = document.getElementById('mark-image-filename')
const previewContainer = document.getElementById('mark-preview-image-container')
const hidden = 'govuk-visually-hidden'

function previewSelectedImage() {
  const file = imageInput.files[0]
  if (file) {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = function(e) {
      previewImage.src = e.target.result
      previewImage.alt = 'Preview of uploaded image'
      previewFilename.innerText=imageInput.files[0].name
      previewContainer.classList.remove(hidden)
      inputContainer.classList.add(hidden)
    }
  }
}
imageInput.addEventListener('change', previewSelectedImage)

// Hide the photo preview and show upload controls when 'change' link is clicked
const changeLink = document.getElementById('change-photo-link')

function showUploadControls() {
  imageInput.value = null
  previewFilename.innerText=''
  previewContainer.classList.add(hidden)
  inputContainer.classList.remove(hidden)
}
changeLink.addEventListener('click', showUploadControls)

// Handle the submit event on the form to correctly redirect based on which button was used to submit
const form = document.getElementById('add-photo-form')

function handleRedirect(e) {
  console.log(e.submitter)
}
form.addEventListener('submit', handleRedirect)