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

let uploadedPhoto = document.getElementById('uploaded-photo')
let dataUrl = uploadedPhoto.attributes['src'].value
let fileName = uploadedPhoto.attributes['data-file-name'].value
let file = dataURLtoFile(dataUrl, fileName)
const input = document.getElementById('js-cropped-image-input')
const container = new DataTransfer()
container.items.add(file)
input.files = container.files
