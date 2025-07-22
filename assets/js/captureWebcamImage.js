const video = document.getElementById('webcam')
const captureBtn = document.getElementById('captureImageButton')
const clearImageBtn = document.getElementById('clearImageButton')
const imageForm = document.getElementById('image-capture-form')
const snapshot = document.getElementById('snapshot')
const webcamImageFileInput = document.getElementById('webcam-image-input')
const webcamSelect = document.getElementById('select-webcam')
const prisonerNumber = document.getElementById('prisonerNumber').textContent ?? ''

const mimetype = 'image/jpeg'

let stream = null

async function getWebcamList() {
  // get camera permissions
  await navigator.mediaDevices.getUserMedia({ video: true, audio: false })

  navigator.mediaDevices.enumerateDevices().then(devices => {
    const videoDevices = devices.filter(device => device.kind === 'videoinput')

    videoDevices.forEach((device, index) => {
      const option = document.createElement('option')
      option.value = device.deviceId
      option.text = device.label || `Camera ${index + 1}`
      webcamSelect.appendChild(option)
    })

    if (videoDevices.length > 0) {
      startWebcam(videoDevices[0].deviceId)
    }
  })
}

async function stopWebcam() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }
}

async function startWebcam(deviceId) {
  try {
    stopWebcam()
    stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: deviceId } } })
    video.srcObject = stream
  } catch (error) {
    alert('Could not access the webcam.')
    console.error('Webcam error:', error)
  }
}

webcamSelect.addEventListener('change', () => {
  startWebcam(webcamSelect.value)
})

clearImageBtn.addEventListener('click', () => {
  snapshot.src = '/assets/images/placeholder.svg'
})

captureBtn.addEventListener('click', () => {
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  const imageDataUrl = canvas.toDataURL(mimetype)
  snapshot.src = imageDataUrl

  canvas.toBlob(
    blob => {
      if (!blob) return

      const file = new File([blob], `${prisonerNumber}-webcam-capture.jpg`, { type: mimetype })

      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      webcamImageFileInput.files = dataTransfer.files
    },
    mimetype,
    0.92,
  )
})

getWebcamList()
