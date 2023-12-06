/* eslint-disable no-underscore-dangle */
class Modal {
  constructor(element) {
    this.element = element
    this.element.setAttribute('hidden', true)
    this.element.setAttribute('role', 'dialog')
    this.element.setAttribute('aria-modal', true)

    this.closeHandlers = []
    this.attachCloseHandlers()

    this._show = this.show.bind(this)
    this._hide = this.hide.bind(this)
    this._maintainFocus = this.maintainFocus.bind(this)
    this._handleKeyDown = this.handleKeyDown.bind(this)
  }

  async load(url) {
    const modalBody = this.element.querySelector('[data-modal-body]')

    // Add loading spinner
    modalBody.innerHTML =
      '<svg width="50" height="50" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_OSmW{transform-origin:center;animation:spinner_T6mA .75s step-end infinite}@keyframes spinner_T6mA{8.3%{transform:rotate(30deg)}16.6%{transform:rotate(60deg)}25%{transform:rotate(90deg)}33.3%{transform:rotate(120deg)}41.6%{transform:rotate(150deg)}50%{transform:rotate(180deg)}58.3%{transform:rotate(210deg)}66.6%{transform:rotate(240deg)}75%{transform:rotate(270deg)}83.3%{transform:rotate(300deg)}91.6%{transform:rotate(330deg)}100%{transform:rotate(360deg)}}</style><g class="spinner_OSmW"><rect x="11" y="1" width="2" height="5" opacity=".14"/><rect x="11" y="1" width="2" height="5" transform="rotate(30 12 12)" opacity=".29"/><rect x="11" y="1" width="2" height="5" transform="rotate(60 12 12)" opacity=".43"/><rect x="11" y="1" width="2" height="5" transform="rotate(90 12 12)" opacity=".57"/><rect x="11" y="1" width="2" height="5" transform="rotate(120 12 12)" opacity=".71"/><rect x="11" y="1" width="2" height="5" transform="rotate(150 12 12)" opacity=".86"/><rect x="11" y="1" width="2" height="5" transform="rotate(180 12 12)"/></g></svg>'

    this.show()

    const response = url && (await fetch(url))

    if (response?.ok) {
      modalBody.innerHTML = await response.text()
    } else {
      modalBody.innerHTML = '<h2>Something went wrong.</h2><p>The error has been logged. Please try again.</p>'
    }
    this.attachCloseHandlers()
  }

  show() {
    this.element.removeAttribute('hidden')

    this.takeFocus()

    document.addEventListener('keydown', this._handleKeyDown)
    document.body.addEventListener('focus', this._maintainFocus, true)

    document.documentElement.style.overflowY = 'hidden'
  }

  hide() {
    this.element.setAttribute('hidden', true)

    document.removeEventListener('keydown', this._handleKeyDown)
    document.body.removeEventListener('focus', this._maintainFocus, true)

    const modalBody = this.element.querySelector('[data-modal-body]')
    modalBody.replaceChildren()

    this.revertFocus()

    document.documentElement.style.overflowY = ''
  }

  handleKeyDown(event) {
    if (event.key === 'Escape') this.hide()
    else if (event.key === 'Tab') trapFocus(event)
  }

  takeFocus() {
    this.previouslyFocused = document.activeElement

    const target = this.element.querySelector('[autofocus]') || getFocusableChildren(this.element)[0]

    if (target) target.focus()
  }

  maintainFocus(event) {
    const isInModal = event.target.closest('[aria-modal="true"]')
    if (!isInModal) this.takeFocus()
  }

  revertFocus() {
    if (this.previouslyFocused && this.previouslyFocused.focus) {
      this.previouslyFocused.focus()
    }
  }

  attachCloseHandlers() {
    this.closeHandlers.forEach(closer => closer.removeEventListener('click', this._hide))
    this.closeHandlers = [...this.element.querySelectorAll('[data-modal-hide]')]
    this.closeHandlers.forEach(closer => closer.addEventListener('click', this._hide))
  }
}

function trapFocus(event) {
  const focusableChildren = getFocusableChildren(this.element)
  const focusedItemIndex = focusableChildren.indexOf(document.activeElement)
  const lastIndex = focusableChildren.length - 1

  if (event.shiftKey && focusedItemIndex === 0) {
    focusableChildren[lastIndex].focus()
    event.preventDefault()
  } else if (!event.shiftKey && focusedItemIndex === lastIndex) {
    focusableChildren[0].focus()
    event.preventDefault()
  }
}

function getFocusableChildren(root) {
  const elements = [
    ...root.querySelectorAll(
      'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])',
    ),
  ]

  return elements.filter(element => element.offsetWidth || element.offsetHeight || element.getClientRects().length)
}
