var fileUploadDiv = document.getElementById('file-upload')
var previewDiv = document.getElementById('file-upload-preview')
var previewFileName = document.getElementById('file-name')

var loadFile = function (event) {
  var reader = new FileReader()
  reader.onload = function () {
    var output = document.getElementById('output')
    output.src = reader.result
  }
  reader.readAsDataURL(event.target.files[0])

  fileUploadDiv.style.display = 'none'
  previewDiv.style.display = 'flex'
  previewFileName.textContent = event.target.files[0].name
}

document.getElementById('photo-upload').addEventListener('change', loadFile)
