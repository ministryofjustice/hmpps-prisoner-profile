import '../cropper.js'

let cropping = false
let croppingInit = false
let constrainImage = false

// This is the dimensions of the canvas
const FINAL_WIDTH = 480
const FINAL_HEIGHT = 600

const MAX_WIDTH = 221
const MAX_HEIGHT = 276
const RATIO = MAX_WIDTH / MAX_HEIGHT

const uploadedPhoto = document.getElementById('photo-preview')
const fileName = uploadedPhoto.attributes['data-file-name'].value
const fileType = uploadedPhoto.attributes['data-file-type'].value

function dataURLtoFile(dataurl, filename) {
  let arr = dataurl.split(',')
  let mime = arr[0].match(/:(.*?);/)[1]
  let bstr = atob(arr[arr.length - 1])
  let n = bstr.length
  let u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new File([u8arr], filename, { type: mime })
}

function setFormPhoto(file) {
  const input = document.getElementById('js-cropped-image-input')
  const container = new DataTransfer()
  container.items.add(file)
  input.files = container.files
}

function withImageManipulation(callback) {
  const cropperImage = document.querySelector('cropper-image')
  cropperImage.rotatable = true
  cropperImage.scalable = true
  cropperImage.translatable = true
  cropperImage.skewable = true

  callback(cropperImage)

  cropperImage.rotatable = false
  cropperImage.scalable = false
  cropperImage.translatable = false
  cropperImage.skewable = false
}

function constrainedToImage(selection) {
  const cropperCanvas = document.querySelector('cropper-canvas')
  const image = document.querySelector('cropper-image')
  const cropperImageRect = image.getBoundingClientRect()
  const cropperCanvasRect = cropperCanvas.getBoundingClientRect()
  const maxSelection = {
    x: cropperImageRect.left - cropperCanvasRect.left,
    y: cropperImageRect.top - cropperCanvasRect.top,
    width: Math.min(cropperImageRect.width, cropperCanvasRect.width),
    height: Math.min(cropperImageRect.height, cropperCanvasRect.height),
  }

  return (
    selection.x >= maxSelection.x &&
    selection.y >= maxSelection.y &&
    selection.x + selection.width <= maxSelection.x + maxSelection.width &&
    selection.y + selection.height <= maxSelection.y + maxSelection.height
  )
}

function setFormPhotoToCroppedResult() {
  const selector = document.querySelector('cropper-selection')
  // The width and height the image gets scaled to in the API, this prevents the image becoming pixellated
  selector.$toCanvas({ width: FINAL_WIDTH, height: FINAL_HEIGHT }).then(canvas => {
    canvas.toBlob(blob => {
      const file = new File([blob], fileName, {
        type: fileType,
        lastModified: new Date().getTime(),
      })
      const callback = dataUrl => {
        document.getElementById('photo-preview').src = dataUrl
      }
      const a = new FileReader()
      a.onload = e => callback(e.target.result)
      a.readAsDataURL(blob)
      setFormPhoto(file)
    })
  })
}

function setCropperListener(fileName, fileType) {
  const canvas = document.querySelector('cropper-canvas')
  canvas.addEventListener('actionend', actionEvent => {
    setFormPhotoToCroppedResult()
  })
}

function setSelectionListener() {
  const selector = document.querySelector('cropper-selection')
  selector.addEventListener('change', e => {
    if (constrainImage && !constrainedToImage(e.detail)) e.preventDefault()
  })
}

function toggleCrop() {
  if (cropping) {
    document.getElementById('photo-preview-container').style.display = 'block'
    document.getElementById('photo-cropper-container').style.display = 'none'
    cropping = false
  } else {
    document.getElementById('photo-preview-container').style.display = 'none'
    document.getElementById('photo-cropper-container').style.display = 'block'
    cropping = true
    if (!croppingInit) {
      resetSelectionLocation()
      setSelectionListener()
      croppingInit = true
    }
  }
}

function resetSelectionLocation() {
  // Toggle constraining off so we can move
  constrainImage = false
  const selection = document.querySelector('cropper-selection')
  const cropperImage = document.querySelector('cropper-image')
  const cropperImageRect = cropperImage.getBoundingClientRect()

  const cropperCanvas = document.querySelector('cropper-canvas')
  const cropperCanvasRect = cropperCanvas.getBoundingClientRect()

  // Check that setting the width doesnt overflow the height being constrained to the image
  const maxWidth = Math.min(cropperImageRect.width, cropperCanvasRect.width)
  const heightWithMaxWidth = maxWidth / RATIO
  const selectionX = cropperImageRect.left - cropperCanvasRect.left
  const selectionY = cropperImageRect.top - cropperCanvasRect.top
  if (heightWithMaxWidth < MAX_HEIGHT) {
    // Scale the width so that it can be dragged without being locked
    selection.$change(selectionX, selectionY, maxWidth * 0.9, heightWithMaxWidth * 0.9).$center()
  } else {
    // Set the height in the cases the width overflows the height
    const maxHeight = Math.min(cropperImageRect.height, cropperCanvasRect.height)
    const widthWithMaxHeight = maxHeight * RATIO

    // Scale the height so that it can be dragged without being locked
    selection.$change(selectionX, selectionY, widthWithMaxHeight * 0.9, maxHeight * 0.9).$center()
  }

  // Reenable constraining
  constrainImage = true
}

function rotateImage(degrees) {
  withImageManipulation(cropperImage => cropperImage.$rotate(`${degrees}deg`).$center('contain'))
  resetSelectionLocation()
  setFormPhotoToCroppedResult()
}

const rotateClockwise = e => {
  e.preventDefault()
  rotateImage(90)
}

function setButtonListeners() {
  document.querySelectorAll('.hmpps-button__toggle-crop').forEach(button =>
    button.addEventListener('click', e => {
      e.preventDefault()
      toggleCrop()
    }),
  )
  document
    .querySelectorAll('.hmpps-button__rotate-clockwise')
    .forEach(button => button.addEventListener('click', rotateClockwise))
}

function pageInit() {
  let dataUrl = uploadedPhoto.attributes['src'].value
  let file = dataURLtoFile(dataUrl, fileName)
  setFormPhoto(file)
  setCropperListener()
  setButtonListeners()
}

window.onload = () => {
  pageInit()
  toggleCrop()
  withImageManipulation(cropperImage => cropperImage.$center('contain'))
  resetSelectionLocation()
  setFormPhotoToCroppedResult()
}
