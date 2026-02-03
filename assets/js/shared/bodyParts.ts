import { Component } from 'govuk-frontend'

/**
 * When the `bodyParts` component is interactive (not disabled),
 * this turns anchors into an interactive group of radio buttons.
 * Without javascript, they cannot function correctly and should remain as plain SVG anchors.
 */
export class BodyParts extends Component<HTMLDivElement> {
  static moduleName = 'body-parts'
  static elementType = HTMLDivElement

  selectedValue: string | null

  private readonly $anchors: SVGAElement[]
  private readonly $message: HTMLParagraphElement
  private readonly $tooltip: HTMLSpanElement
  private readonly $controlsField: HTMLInputElement | undefined

  constructor(root: HTMLDivElement) {
    super(root)

    this.$anchors = Array.from(root.getElementsByTagName('a')) as unknown as SVGAElement[]
    this.$message = root.getElementsByClassName('dps-body-parts__message').item(0) as HTMLParagraphElement
    this.$tooltip = root.getElementsByClassName('dps-body-parts__tooltip').item(0) as HTMLSpanElement
    if (root.dataset.controlsField) {
      this.$controlsField = document.getElementsByName(root.dataset.controlsField).item(0) as HTMLInputElement
    }

    this.selectedValue =
      this.$anchors.find($anchor => $anchor.dataset.value === root.dataset.selectedBodyPart)?.dataset.value ?? null

    this.bindChangeEvent()
    this.createInteractiveRadioGroup()
  }

  /**
   * Update controlled field, url and message on selection change
   */
  private bindChangeEvent(): void {
    this.$root.addEventListener('change', (event: CustomEvent<ChangeDetail>) => {
      const url = new URL(window.location.href)
      if (event.detail.selected) {
        const { value, label } = event.detail.selected
        if (this.$controlsField) {
          this.$controlsField.value = value
        }
        this.displaySelection(label)
        url.searchParams.set('selected', value)
      } else {
        if (this.$controlsField) {
          this.$controlsField.removeAttribute('value')
        }
        this.displaySelection(undefined)
        url.searchParams.delete('selected')
      }
      window.history.replaceState(null, '', url)
    })
  }

  private createInteractiveRadioGroup(): void {
    this.$root.role = 'radiogroup'
    this.$root.ariaRequired = 'true'

    /** prevents tooltip from being placed at preset location on focus after a click */
    let autoPositionTooltip = true

    let initialFocusableIndex = this.$anchors.findIndex($anchor => $anchor.dataset.value === this.selectedValue)
    if (initialFocusableIndex < 0) {
      initialFocusableIndex = 0
    }
    this.$anchors.forEach(($anchor, index) => {
      const value = $anchor.dataset.value
      const label = $anchor.ariaLabel

      $anchor.role = 'radio'
      $anchor.tabIndex = index === initialFocusableIndex ? 0 : -1
      $anchor.ariaChecked = $anchor.dataset.value === this.selectedValue ? 'true' : 'false'

      $anchor.addEventListener('click', event => {
        event.preventDefault()

        $anchor.tabIndex = 0
        this.$anchors.forEach(($someAnchor, someIndex) => {
          if (someIndex !== index) {
            $someAnchor.tabIndex = -1
          }
          $someAnchor.classList.remove('dps-body-part--selected')
          $someAnchor.ariaChecked = 'false'
        })

        let changeEvent: CustomEvent<ChangeDetail>
        if (this.selectedValue === value) {
          this.selectedValue = null
          changeEvent = new CustomEvent('change', { detail: { selected: null } })
        } else {
          this.selectedValue = value
          changeEvent = new CustomEvent('change', { detail: { selected: { value, label } } })
          $anchor.classList.add('dps-body-part--selected')
          $anchor.ariaChecked = 'true'
        }
        this.$root.dispatchEvent(changeEvent)
      })

      $anchor.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          event.preventDefault()
          event.stopPropagation()
          this.focusOnAnchorAt(index - 1)
        } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          event.preventDefault()
          event.stopPropagation()
          this.focusOnAnchorAt((index + 1) % this.$anchors.length)
        } else if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault()
          event.stopPropagation()
          $anchor.dispatchEvent(new MouseEvent('click', { cancelable: true }))
          $anchor.focus({ preventScroll: true })
        }
      })

      const $tooltipAnchor = $anchor.getElementsByClassName('dps-body-part__tooltip-anchor').item(0) as SVGCircleElement
      $anchor.addEventListener('focus', () => {
        const { x, y, width, height } = $anchor.getBoundingClientRect()
        const tolerance = 20
        if (
          x + width < tolerance ||
          y + height < tolerance ||
          window.innerWidth - x < tolerance ||
          window.innerHeight - y < tolerance
        ) {
          $anchor.scrollIntoView()
        }

        this.showTooltip(label)
        if (autoPositionTooltip) {
          const tooltipAnchor = $tooltipAnchor.getBoundingClientRect()
          this.positionTooltipAt(tooltipAnchor.x + tooltipAnchor.width / 2, tooltipAnchor.y + tooltipAnchor.height / 2)
        } else {
          autoPositionTooltip = true
        }
      })

      $anchor.addEventListener('blur', () => {
        this.hideTooltipUnlessFocused()
      })

      $anchor.addEventListener('mousedown', event => {
        autoPositionTooltip = false
      })

      $anchor.addEventListener('mouseover', event => {
        this.showTooltip(label)
        this.positionTooltipAt(event.clientX, event.clientY)
      })

      $anchor.addEventListener('mousemove', event => {
        this.positionTooltipAt(event.clientX, event.clientY)
      })

      $anchor.addEventListener('mouseout', () => {
        this.hideTooltip()
      })
    })

    window.addEventListener('blur', () => {
      this.hideTooltip()
    })
    window.addEventListener('scroll', () => {
      this.hideTooltip()
    })
    window.addEventListener('resize', () => {
      this.hideTooltip()
    })
  }

  private focusOnAnchorAt(index: number): void {
    const $anchor = this.$anchors.at(index)
    $anchor.tabIndex = 0
    $anchor.focus({ preventScroll: true })
    this.$anchors.forEach(($someAnchor, someIndex) => {
      if (someIndex !== index) {
        $someAnchor.tabIndex = -1
      }
    })
  }

  private showTooltip(label: string): void {
    this.$tooltip.innerText = label
    this.$tooltip.style.display = 'block'
  }

  private positionTooltipAt(x: number, y: number): void {
    this.$tooltip.style.left = `${x - this.$tooltip.offsetWidth / 2}px`
    this.$tooltip.style.top = `${y - this.$tooltip.offsetHeight - 12}px`
  }

  private hideTooltip(): void {
    this.$tooltip.style.display = 'none'
  }

  private hideTooltipUnlessFocused(): void {
    if (!this.$anchors.some($someAnchor => $someAnchor === document.activeElement)) {
      this.hideTooltip()
    }
  }

  private displaySelection(label?: string | undefined): void {
    this.$message.innerText = label ? `${label} selected` : 'No body part selected'
  }
}

interface ChangeDetail {
  selected: null | {
    value: string
    label: string
  }
}
