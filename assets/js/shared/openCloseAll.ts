import { Component } from 'govuk-frontend'

/**
 * Adds an “open/close all” button to a container which toggles `details` elements inside it
 */
export class OpenCloseAll extends Component<HTMLDivElement> {
  static moduleName = 'hmpps-open-close-all'
  static elementType = HTMLDivElement

  private readonly openText: string
  private readonly closeText: string
  private readonly $openCloseAllDetails: HTMLDetailsElement[]
  private readonly $openCloseAllButton: HTMLButtonElement

  constructor(root: HTMLDivElement) {
    super(root)

    root.classList.add('hmpps-open-close-all')

    this.openText = this.$root.dataset.openText || 'Open all'
    this.closeText = this.$root.dataset.closeText || 'Close all'

    this.$openCloseAllDetails = Array.from(this.$root.getElementsByTagName('details'))
    this.$openCloseAllButton = this.createButton()
    this.$openCloseAllButton.addEventListener('click', () => this.buttonToggle())
    this.$openCloseAllDetails.forEach($detail => $detail.addEventListener('toggle', () => this.detailToggle()))
  }

  private createButton(): HTMLButtonElement {
    const $openCloseAllButton = document.createElement('button')
    $openCloseAllButton.type = 'button'
    $openCloseAllButton.ariaExpanded = 'false'
    $openCloseAllButton.classList.add('hmpps-open-close-all__button')
    $openCloseAllButton.innerText = this.openText
    return this.$root.insertBefore($openCloseAllButton, this.$root.firstChild)
  }

  private buttonToggle(): void {
    const allOpen = this.areAllOpen()
    this.$openCloseAllDetails.forEach($detail => {
      $detail.open = !allOpen
      if (!allOpen) {
        this.$openCloseAllButton.innerText = this.closeText
        this.$openCloseAllButton.ariaExpanded = 'true'
      } else {
        this.$openCloseAllButton.innerText = this.openText
        this.$openCloseAllButton.ariaExpanded = 'false'
      }
    })
  }

  private detailToggle(): void {
    const allOpen = this.areAllOpen()
    if (allOpen) {
      this.$openCloseAllButton.innerText = this.closeText
      this.$openCloseAllButton.ariaExpanded = 'true'
    } else {
      this.$openCloseAllButton.innerText = this.openText
      this.$openCloseAllButton.ariaExpanded = 'false'
    }
  }

  public areAllOpen(): boolean {
    return this.$openCloseAllDetails.every($detail => $detail.open)
  }
}
