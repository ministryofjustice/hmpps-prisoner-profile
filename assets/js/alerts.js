function initDynamicDropdowns() {
  const alertTypeElement = document.getElementById('alertType')
  const alertCodeElement = document.getElementById('alertCode')
  const typeCodeMap = JSON.parse(document.getElementById('typeCodeMap').textContent)

  alertTypeElement.addEventListener('change', async () => {
    alertCodeElement.length = 1
    if (alertTypeElement.value === '') return

    typeCodeMap[alertTypeElement.value]?.forEach(alertCode => {
      alertCodeElement.add(new Option(alertCode.text, alertCode.value))
    })
  })
}

initDynamicDropdowns()
