export function addAnotherButton() {
  const button = document.getElementById('submit-and-add-another')

  if (button) {
    function onAddAnotherButtonClick(e: MouseEvent) {
      e.preventDefault()
      const form = (e.target as HTMLInputElement).form
      form.action = '?addAnother=true'
      form.submit()
    }

    button.style.display = 'inline-block'
    button.onclick = onAddAnotherButtonClick
  }
}
