function addAnotherButton() {
  const button = document.getElementById('submit-and-add-another')
  function onAddAnotherButtonClick(e) {
    e.preventDefault()
    const form = e.target.form
    form.action = "?addAnother=true"
    form.submit()
  }

  button.style.display = 'inline-block'
  button.onclick = onAddAnotherButtonClick
}

addAnotherButton()
