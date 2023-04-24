function initCaseNotes() {
  const typeElement = document.getElementById('type')
  const subTypeElement = document.getElementById('subType')
  const typeSubTypeMap = JSON.parse(document.getElementById('typeData').textContent)

  typeElement.addEventListener('change', () => {
    subTypeElement.length = 1
    if (typeElement.value === '') return
    typeSubTypeMap[typeElement.value]?.forEach(subType => {
      subTypeElement.add(new Option(subType.text, subType.value))
    })
  })
}

initCaseNotes()
