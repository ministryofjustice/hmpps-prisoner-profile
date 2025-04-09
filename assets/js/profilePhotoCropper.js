import '../cropper.js'

let cropping = false
let croppingInit = false

const MAX_WIDTH = 427
const MAX_HEIGHT = 570
const RATIO = MAX_WIDTH / MAX_HEIGHT

function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[arr.length - 1]),
    n = bstr.length,
    u8arr = new Uint8Array(n)
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
    height: Math.min(cropperImageRect.height, cropperCanvasRect.height)
  }
  console.log(maxSelection)
  console.log(selection)

  return (
    selection.x >= maxSelection.x &&
    selection.y >= maxSelection.y &&
    selection.x + selection.width <= maxSelection.x + maxSelection.width &&
    selection.y + selection.height <= maxSelection.y + maxSelection.height
  )
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
    if (!constrainedToImage(e.detail)) e.preventDefault()
  })
}

function toggleCrop(e) {
  e.preventDefault()
  if (cropping) {
    document.getElementById('photo-preview-container').style.display = 'block'
    document.getElementById('image-cropper-container').style.display = 'none'
    cropping = false
  } else {
    document.getElementById('photo-preview-container').style.display = 'none'
    document.getElementById('image-cropper-container').style.display = 'block'
    cropping = true
    if (!croppingInit) {
      const selection = document.querySelector('cropper-selection').$reset().$render()
      const cropperImage = document.querySelector('cropper-image')
      const cropperImageRect = cropperImage.getBoundingClientRect()

      const cropperCanvas = document.querySelector('cropper-canvas')
      const cropperCanvasRect = cropperCanvas.getBoundingClientRect()

      // Check that setting the width doesnt overflow the height being constrained to the image
      const minWidth = Math.min(cropperImageRect.width, cropperCanvasRect.width)
      const heightWithMinWidth = minWidth / RATIO
      if (heightWithMinWidth < MAX_HEIGHT) {
        // Scale the width so that it can be dragged without being locked
        selection.$change(0, 0, minWidth * 0.9)
      } else {
        // Set the height in the cases the width overflows the height
        const minHeight = Math.min(cropperImageRect.height, cropperCanvasRect.height)
        // Scale the height so that it can be dragged without being locked
        selection.$change(0, 0, 0, minHeight * 0.9)
      }
      setSelectionListener()
      croppingInit = true
    }
  }
}

function pageInit() {
  let uploadedPhoto = document.getElementById('photo-preview')
  let dataUrl = uploadedPhoto.attributes['src'].value
  let fileName = uploadedPhoto.attributes['data-file-name'].value
  let fileType = uploadedPhoto.attributes['data-file-type'].value
  let file = dataURLtoFile(dataUrl, fileName)
  setFormPhoto(file)
  setCropperListener()
  document.getElementById('toggle-crop-button').addEventListener('click', toggleCrop)
}

pageInit()
