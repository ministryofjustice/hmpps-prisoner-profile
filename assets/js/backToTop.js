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

  var $h1 = document.querySelector('h1')
  var $footer = document.querySelector('.govuk-footer')
  var $sidebar = document.querySelector('.app-sidebar')

  // Check if there is anything to observe
  if (!$h1 || !$footer || !$sidebar) {
    return
  }

  var h1IsIntersecting = false
  var footerIsIntersecting = false
  var sidebarIsIntersecting = false

  var observer = new window.IntersectionObserver(
    function (entries) {
      // Find the elements we care about from the entries
      var h1Entry = entries.find(function (entry) {
        return entry.target === $h1
      })
      var footerEntry = entries.find(function (entry) {
        return entry.target === $footer
      })
      var sidebarEntry = entries.find(function (entry) {
        return entry.target === $sidebar
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

      // If the sidebar or h1 is visible then hide the back to top link as it's not required
      if (sidebarIsIntersecting || h1IsIntersecting) {
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
}

// Initialise back to top
var $backToTop = document.querySelector('[data-module="hmpps-back-to-top"]')
new BackToTop($backToTop).init()
