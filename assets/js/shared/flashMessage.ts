import { Component } from 'govuk-frontend'

/**
 * Displays messages on the page that fade out after a brief period.
 * Used with `req.flash('flashMessage', { text: '…' })` to indicate successful actions without using a GOV.UK Panel.
 *
 * Elements with the “alert” ARIA role only announce dynamic changes to content and not on load.
 * Therefore this component creates a new element with the alert role and populates it after a sufficient pause.
 */
export class FlashMessage extends Component<HTMLDivElement> {
  static moduleName = 'hmpps-flash-message'
  static elementType = HTMLDivElement

  constructor(root: HTMLDivElement) {
    super(root)

    // extract message and create alert element
    const $p = root.querySelector('p')
    const message = $p.textContent
    $p.removeAttribute('role')
    const $alertSpan = document.createElement('span')
    $alertSpan.setAttribute('role', 'alert')

    // re-insert message content after brief pause
    setTimeout(() => {
      $p.textContent = ''
      $p.appendChild($alertSpan)
      $alertSpan.innerText = message
    }, 1_000)

    // eventually, remove entire component
    setTimeout(() => {
      if (root.parentNode) {
        root.parentNode.removeChild(root)
      }
    }, 15_000)
  }
}
