const printLinks = document.querySelectorAll('.hmpps-print-link')

if (printLinks?.length) {
  printLinks.forEach(el =>
    el.addEventListener('click', evt => {
      evt.preventDefault()
      window.print()
    }),
  )
}
