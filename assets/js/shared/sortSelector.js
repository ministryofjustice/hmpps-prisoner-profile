export function sortSelector() {
  Array.from(document.getElementsByClassName('hmpps-sort-selector__select')).forEach(s => {
    s.addEventListener('change', () => {
      s.form.submit()
    })
  })
}
