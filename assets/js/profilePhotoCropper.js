import '../cropper.js'

let cropping = false
let croppingInit = false
let constrainImage = false

const MAX_WIDTH = 427
const MAX_HEIGHT = 570
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
  selector.$toCanvas().then(canvas => {
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
  const selector = document.querySelector('cropper-selection')
  canvas.addEventListener('actionend', actionEvent => {
    selector.$toCanvas().then(canvas => {
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
  })
}

function setSelectionListener() {
  const selector = document.querySelector('cropper-selection')
  selector.addEventListener('change', e => {
    if (constrainImage && !constrainedToImage(e.detail)) e.preventDefault()
  })
}

function toggleCrop(e) {
  e.preventDefault()
  if (cropping) {
    document.getElementById('photo-preview-container').style.display = 'block'
    document.getElementById('image-cropper-container').style.display = 'none'
    document.getElementById('rotate-button-group').style.display = 'none'
    cropping = false
  } else {
    document.getElementById('photo-preview-container').style.display = 'none'
    document.getElementById('image-cropper-container').style.display = 'block'
    document.getElementById('rotate-button-group').style.display = 'block'
    cropping = true
    if (!croppingInit) {
      document.querySelector('cropper-selection').$reset().$render()
      document.querySelector('cropper-image').$center('contain')
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
  const minWidth = Math.min(cropperImageRect.width, cropperCanvasRect.width)
  const heightWithMinWidth = minWidth / RATIO
  const selectionX = cropperImageRect.left - cropperCanvasRect.left
  const selectionY = cropperImageRect.top - cropperCanvasRect.top
  if (heightWithMinWidth < MAX_HEIGHT) {
    // Scale the width so that it can be dragged without being locked
    selection.$change(selectionX, selectionY, minWidth * 0.9)
  } else {
    // Set the height in the cases the width overflows the height
    const minHeight = Math.min(cropperImageRect.height, cropperCanvasRect.height)
    // Scale the height so that it can be dragged without being locked
    selection.$change(selectionX, selectionY, 0, minHeight * 0.9)
  }

  // Reenable constraining
  constrainImage = true
}

function rotateImage(degrees) {
  const cropperImage = document.querySelector('cropper-image')
  // ="Picture" initial-center-size="contain" rotatable skewable scalable translatable></cropper-image>
  cropperImage.rotatable = true
  cropperImage.scalable = true
  cropperImage.translatable = true
  cropperImage.skewable = true

  console.log("???")

  cropperImage.$rotate(`${degrees}deg`).$center('contain')

  cropperImage.rotatable = false
  cropperImage.scalable = false
  cropperImage.translatable = false
  cropperImage.skewable = false

  resetSelectionLocation()
  setFormPhotoToCroppedResult()
}

const rotateClockwise = e => {
  e.preventDefault()
  rotateImage(90)
}

const rotateAnticlockwise = e => {
  e.preventDefault()
  rotateImage(-90)
}

function setButtonListeners() {
  document.getElementById('toggle-crop-button').addEventListener('click', toggleCrop)
  document.getElementById('rotate-clockwise').addEventListener('click', rotateClockwise)
  document.getElementById('rotate-anti-clockwise').addEventListener('click', rotateAnticlockwise)
}

function pageInit() {
  let dataUrl = uploadedPhoto.attributes['src'].value
  let file = dataURLtoFile(dataUrl, fileName)
  setFormPhoto(file)
  setCropperListener()
  setButtonListeners()
}

pageInit()
