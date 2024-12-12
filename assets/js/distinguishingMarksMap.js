function BodyPartSelector($baseImage, $selections, $description, $formField) {
  this.$baseImage = $baseImage
  this.$selections = $selections
  this.$description = $description
  this.$formField = $formField
}

BodyPartSelector.prototype.init = function () {
  if (!this.$baseImage || !this.$selections || !this.$description || !this.$formField) {
    return
  }

  this.$selections.forEach(area => {
    area.addEventListener('mouseover', () => {
      this.$baseImage.classList.add('dm-base-image-hover')
      this.$baseImage.setAttribute('data-hover-value', area.getAttribute('data-area-value'))
    })

    area.addEventListener('mouseout', () => {
      this.$baseImage.classList.remove('dm-base-image-hover')
      this.$baseImage.removeAttribute('data-area-value')
    })

    area.addEventListener('click', event => {
      event.preventDefault()
      this.setNewSelection(area)
    })
  })
}

BodyPartSelector.prototype.setNewSelection = function (areaSelected) {
  var newSelection = areaSelected.getAttribute('data-area-value')
  var oldSelection = this.$baseImage.getAttribute('data-selected')

  if (oldSelection === newSelection) {
    this.$baseImage.classList.remove('dm-base-image-selected')
    this.$baseImage.removeAttribute('data-selected')
    this.$description.innerHTML = 'No body part selected'
    this.updateQueryParam('selected', null)
    this.$formField.removeAttribute('value')
    return
  }

  var newSelectionText = areaSelected.getAttribute('alt')
  this.$baseImage.classList.add('dm-base-image-selected')
  this.$baseImage.setAttribute('data-selected', newSelection)
  this.$description.innerHTML = newSelectionText + ' selected'
  this.$formField.value = newSelection
  this.updateQueryParam('selected', newSelection)
}

BodyPartSelector.prototype.updateQueryParam = function (key, value) {
  const url = new URL(window.location)
  if (value) {
    url.searchParams.set(key, value)
  } else {
    url.searchParams.delete(key)
  }
  history.pushState(null, '', url)
}

const $baseContainer = document.querySelector('.new-dm-body-image-container')
const $selections = document.querySelectorAll('.new-dm-body-image-container area')
const $description = document.querySelector('#distinguishing-mark-selection-text')
const $formField = document.querySelector('#body-part-form input[name="bodyPart"]')
new BodyPartSelector($baseContainer, $selections, $description, $formField).init()
