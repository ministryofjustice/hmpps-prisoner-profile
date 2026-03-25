export function sortSelector(): void {
  Array.from(document.getElementsByClassName('hmpps-sort-selector__select')).forEach((s: HTMLSelectElement) => {
    const button = s.form.querySelector('.hmpps-sort-selector__sort-button')
    if (button) {
      button.remove()
    }
    s.addEventListener('change', () => {
      s.form.submit()
    })
  })
}
