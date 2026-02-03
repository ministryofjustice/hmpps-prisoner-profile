export function printPage(): void {
  const printLinks = document.querySelectorAll<HTMLAnchorElement>('.hmpps-print-link')

  printLinks?.forEach(el =>
    el.addEventListener('click', evt => {
      evt.preventDefault()
      window.print()
    })
  )
}
