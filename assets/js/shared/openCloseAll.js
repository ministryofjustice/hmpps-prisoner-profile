import { nodeListForEach } from './helpers'

function OpenCloseAll($module) {
  this.$module = $module
}

OpenCloseAll.prototype.init = function () {
  if (!this.$module) {
    return
  }

  this.$module.setAttribute('class', 'hmpps-open-close-all')
  const openText = this.$module.getAttribute('data-open-text') || 'Open all'
  const closeText = this.$module.getAttribute('data-close-text') || 'Close all'

  const $openCloseAllButton = document.createElement('button')
  $openCloseAllButton.setAttribute('type', 'button')
  $openCloseAllButton.setAttribute('aria-expanded', 'false')
  $openCloseAllButton.setAttribute('class', 'hmpps-open-close-all__button')
  $openCloseAllButton.innerHTML = openText

  const $openCloseAllDetails = this.$module.querySelectorAll('details')

  this.$module.insertBefore($openCloseAllButton, this.$module.firstChild)

  $openCloseAllButton.addEventListener(
    'click',
    function () {
      const allOpen = areAllOpen($openCloseAllDetails)
      $openCloseAllDetails.forEach(function ($detail) {
        if (!allOpen) {
          $detail.setAttribute('open', 'open')
          $openCloseAllButton.innerHTML = closeText
          $openCloseAllButton.setAttribute('aria-expanded', 'true')
        } else {
          $detail.removeAttribute('open')
          $openCloseAllButton.innerHTML = openText
          $openCloseAllButton.setAttribute('aria-expanded', 'false')
        }
      })
    }.bind(this),
  )

  $openCloseAllDetails.forEach(function ($detail) {
    $detail.addEventListener(
      'toggle',
      function () {
        const allOpen = areAllOpen($openCloseAllDetails)

        if (allOpen) {
          $openCloseAllButton.innerHTML = closeText
          $openCloseAllButton.setAttribute('aria-expanded', 'true')
        } else {
          $openCloseAllButton.innerHTML = openText
          $openCloseAllButton.setAttribute('aria-expanded', 'false')
        }
      }.bind(this),
    )
  })

  function areAllOpen($allDetails) {
    let allOpen = true
    $allDetails.forEach(function ($detail) {
      if (!$detail.hasAttribute('open')) {
        allOpen = false
      }
    })
    return allOpen
  }
}

const $openCloseAlls = document.querySelectorAll('[data-module="hmpps-open-close-all"]')

export function openCloseAll() {
  nodeListForEach($openCloseAlls, function ($openCloseAll) {
    new OpenCloseAll($openCloseAll, {}).init()
  })
}
