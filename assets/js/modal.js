/**
 * Modal component
 *
 * Usage:
 *
 * Include the component in your Nunjucks template, e.g.
 *
 *  ```
 *  {% from 'components/modal/modal.njk' import modal %}
 *  ```
 *
 * Then to use dynamic loading on modal content,
 * ```
 *  {{ modal({
 *      id: "my-modal",
 *      title: "My modal title",
 *      classes: "optional-classes",
 *      close: {
 *          label: "Close"
 *      }
 *  }) }}
 * ```
 * Create a modal component and listen for trigger events (e.g. click) to load and show modal,
 * ```
 *  const myModal = new Modal(document.getElementById('my-modal'))
 *
 *  document.getElementById('show-modal-btn').addEventListener('click', event => {
 *     event.preventDefault()
 *     myModal.load('url/to/content')
 * ```
 *
 * Or to use static modal content,
 * ```
 *  {% call modal({
 *      id: "my-modal",
 *      title: "My modal title",
 *      classes: "optional-classes",
 *      close: {
 *          label: "Close"
 *      },
 *      call: true
 *  }) %}
 *    <h2>My modal</h2>
 *    <p>Static content</p>
 *  {% endcall %}
 * ```
 * Create a modal component and listen for trigger events (e.g. click) to show modal,
 * ```
 *  const myModal = new Modal(document.getElementById('my-modal'))
 *
 *  document.getElementById('show-modal-btn').addEventListener('click', event => {
 *     event.preventDefault()
 *     myModal.show()
 * ```
 */
/* eslint-disable no-underscore-dangle */
class Modal {
  constructor(element) {
    this.element = element
    this.element.setAttribute('hidden', true)

    this.dialog = this.element.querySelector('.modal-content')
    this.body = this.dialog.querySelector('[data-modal-body]')

    this.closeHandlers = []

    this._show = this.show.bind(this)
    this._hide = this.hide.bind(this)
    this._maintainFocus = this.maintainFocus.bind(this)
    this._handleKeyDown = this.handleKeyDown.bind(this)
  }

  async load(url) {
    // Add loading spinner
    this.body.innerHTML =
      '<svg width="50" height="50" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g class="spinner_OSmW"><rect x="11" y="1" width="2" height="5" opacity=".14"/><rect x="11" y="1" width="2" height="5" transform="rotate(30 12 12)" opacity=".29"/><rect x="11" y="1" width="2" height="5" transform="rotate(60 12 12)" opacity=".43"/><rect x="11" y="1" width="2" height="5" transform="rotate(90 12 12)" opacity=".57"/><rect x="11" y="1" width="2" height="5" transform="rotate(120 12 12)" opacity=".71"/><rect x="11" y="1" width="2" height="5" transform="rotate(150 12 12)" opacity=".86"/><rect x="11" y="1" width="2" height="5" transform="rotate(180 12 12)"/></g></svg>'

    this.show()

    const response = url && (await fetch(url))

    if (response?.ok) {
      this.body.innerHTML = await response.text()
    } else {
      this.body.innerHTML = '<h2>Something went wrong.</h2><p>The error has been logged. Please try again.</p>'
    }
    this.attachCloseHandlers()
  }

  show() {
    this.element.removeAttribute('hidden')
    this.dialog.setAttribute('aria-modal', true)

    this.takeFocus()
    if (this.element.dataset.call) {
      this.attachCloseHandlers()
    }

    document.addEventListener('keydown', this._handleKeyDown)
    document.body.addEventListener('focus', this._maintainFocus, true)

    document.documentElement.style.overflowY = 'hidden'
  }

  hide() {
    this.element.setAttribute('hidden', true)
    this.dialog.removeAttribute('aria-modal')

    document.removeEventListener('keydown', this._handleKeyDown)
    document.body.removeEventListener('focus', this._maintainFocus, true)

    if (!this.element.dataset.call) {
      this.body.replaceChildren()
    }

    this.revertFocus()

    document.documentElement.style.overflowY = ''
  }

  handleKeyDown(event) {
    if (event.key === 'Escape') this.hide()
    else if (event.key === 'Tab') trapFocus(this.element, event)
  }

  takeFocus() {
    this.previouslyFocused = document.activeElement

    this.dialog.focus()
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

function trapFocus(el, event) {
  const focusableChildren = getFocusableChildren(el)
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
