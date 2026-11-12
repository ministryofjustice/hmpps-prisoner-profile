import { Component } from 'govuk-frontend'

/**
 * Repositions “Back to top” link by observing the parts of the page currently displayed
 */
export class BackToTop extends Component<HTMLDivElement> {
  static moduleName = 'hmpps-back-to-top'
  static elementType = HTMLDivElement

  private readonly $h1: HTMLHeadingElement
  private readonly $footer: HTMLDivElement
  private readonly $sidebar: HTMLDivElement
  private readonly $header: HTMLDivElement

  constructor(root: HTMLDivElement) {
    super(root)

    // immovable back-to-top links need no observation
    if (root.classList.contains('hmpps-back-to-top--static')) {
      return
    }

    // Check if we can use Intersection Observers
    if (!('IntersectionObserver' in window)) {
      // If there's no support fallback to regular behaviour
      // Since JavaScript is enabled we can remove the default hidden state
      root.classList.remove('hmpps-back-to-top--hidden')
      return
    }

    this.$h1 = document.querySelector('h1')
    this.$footer = document.querySelector('.connect-dps-common-footer') ?? document.querySelector('.govuk-footer')
    this.$sidebar = document.querySelector('.app-sidebar')
    this.$header = document.querySelector('.connect-dps-common-header')

    // Check if there is anything to observe
    if (this.$h1 && this.$footer && this.$sidebar) {
      this.startObserving()
    }
  }

  private startObserving(): void {
    const isIntersecting = (element: Element | null): boolean => {
      if (!element) return false

      const bounds = element.getBoundingClientRect()
      return bounds.bottom > 0 && bounds.top < window.innerHeight && bounds.right > 0 && bounds.left < window.innerWidth
    }

    const updatePosition = (): void => {
      const h1IsIntersecting = isIntersecting(this.$h1)
      const footerIsIntersecting = isIntersecting(this.$footer)
      const sidebarIsIntersecting = isIntersecting(this.$sidebar)
      const headerIsIntersecting = isIntersecting(this.$header)

      if (sidebarIsIntersecting || h1IsIntersecting || headerIsIntersecting) {
        // If the sidebar, h1, or header is visible then hide the back to top link as it's not required
        this.$root.classList.remove('hmpps-back-to-top--fixed')
        this.$root.classList.add('hmpps-back-to-top--hidden')
      } else if (footerIsIntersecting) {
        // If the footer is visible then set the back to top link at the bottom
        this.$root.classList.remove('hmpps-back-to-top--fixed')
        this.$root.classList.remove('hmpps-back-to-top--hidden')
      } else {
        // If the sidebar and the footer are both hidden then make the back to top link sticky to follow the user
        this.$root.classList.remove('hmpps-back-to-top--hidden')
        this.$root.classList.add('hmpps-back-to-top--fixed')
      }
    }

    const observer = new window.IntersectionObserver(updatePosition)
    observer.observe(this.$h1)
    observer.observe(this.$footer)
    observer.observe(this.$sidebar)
    if (this.$header) {
      observer.observe(this.$header)
    }
    updatePosition()
  }
}
