function BackToTop($module) {
  this.$module = $module
}

BackToTop.prototype.init = function () {
  if (!this.$module) {
    return
  }

  // Check if we can use Intersection Observers
  if (!('IntersectionObserver' in window)) {
    // If there's no support fallback to regular behaviour
    // Since JavaScript is enabled we can remove the default hidden state
    return this.$module.classList.remove('hmpps-back-to-top--hidden')
  }

  const $h1 = document.querySelector('h1')
  const $footer = document.querySelector('.connect-dps-common-footer') ?? document.querySelector('.govuk-footer')
  const $sidebar = document.querySelector('.app-sidebar')
  const $header = document.querySelector('.connect-dps-common-header')

  // Check if there is anything to observe
  if (!$h1 || !$footer || !$sidebar || !$header) {
    return
  }

  let h1IsIntersecting = false
  let footerIsIntersecting = false
  let sidebarIsIntersecting = false
  let headerIsIntersecting = false

  const observer = new window.IntersectionObserver(
    function (entries) {
      // Find the elements we care about from the entries
      const h1Entry = entries.find(function (entry) {
        return entry.target === $h1
      })
      const footerEntry = entries.find(function (entry) {
        return entry.target === $footer
      })
      const sidebarEntry = entries.find(function (entry) {
        return entry.target === $sidebar
      })
      const headerEntry = entries.find(function (entry) {
        return entry.target === $header
      })

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

      // If the sidebar, h1, or header is visible then hide the back to top link as it's not required
      if (sidebarIsIntersecting || h1IsIntersecting || headerIsIntersecting) {
        this.$module.classList.remove('hmpps-back-to-top--fixed')
        this.$module.classList.add('hmpps-back-to-top--hidden')
        // If the footer is visible then set the back to top link at the bottom
      } else if (footerIsIntersecting) {
        this.$module.classList.remove('hmpps-back-to-top--fixed')
        this.$module.classList.remove('hmpps-back-to-top--hidden')
        // If the sidebar and the footer are both hidden then make the back to top link sticky to follow the user
      } else {
        this.$module.classList.remove('hmpps-back-to-top--hidden')
        this.$module.classList.add('hmpps-back-to-top--fixed')
      }
    }.bind(this),
  )

  observer.observe($h1)
  observer.observe($footer)
  observer.observe($sidebar)
  observer.observe($header)
}

export function backToTop() {
  const $backToTop = document.querySelector('[data-module="hmpps-back-to-top"]')
  new BackToTop($backToTop).init()
}
