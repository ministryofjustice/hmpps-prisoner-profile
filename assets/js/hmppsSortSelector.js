/**
 * Get any elements with class 'hmpps-sort-selector__select' and attach an onChange listener
 *
 * When triggered by the user changing the selection, the function submits the containing form
 */
Array.from(document.getElementsByClassName('hmpps-sort-selector__select')).forEach(s => {
  s.addEventListener('change', () => {
    s.form.submit()
  })
})
