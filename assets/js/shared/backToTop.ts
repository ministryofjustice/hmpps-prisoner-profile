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
    if (this.$h1 && this.$footer && this.$sidebar && this.$header) {
      this.startObserving()
    }
  }

  private startObserving(): void {
    let h1IsIntersecting = false
    let footerIsIntersecting = false
    let sidebarIsIntersecting = false
    let headerIsIntersecting = false
    const observer = new window.IntersectionObserver(entries => {
      // Find the elements we care about from the entries
      const h1Entry = entries.find(entry => entry.target === this.$h1)
      const footerEntry = entries.find(entry => entry.target === this.$footer)
      const sidebarEntry = entries.find(entry => entry.target === this.$sidebar)
      const headerEntry = entries.find(entry => entry.target === this.$header)

      // If there is an entry this means the element has changed so lets check if it's intersecting.
      if (h1Entry) {
        h1IsIntersecting = h1Entry.isIntersecting
      }
      if (footerEntry) {
        footerIsIntersecting = footerEntry.isIntersecting
      }
      if (sidebarEntry) {
        sidebarIsIntersecting = sidebarEntry.isIntersecting
      }
      if (headerEntry) {
        headerIsIntersecting = headerEntry.isIntersecting
      }

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
    })
    observer.observe(this.$h1)
    observer.observe(this.$footer)
    observer.observe(this.$sidebar)
    observer.observe(this.$header)
  }
}
