export function justifyAccessBackLink(): void {
  document.querySelector<HTMLAnchorElement>('.justify-access__back-link')
    ?.addEventListener('click', event => {
      event.preventDefault()
      history.back()
    })
}
