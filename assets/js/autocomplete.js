document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.js-autocomplete-select').forEach(selectElement => {
    const invalidInput = document.getElementById(`${selectElement.id}-error`)?.value

    const inputClasses = selectElement.getAttribute('data-input-classes')
    const menuClasses = selectElement.getAttribute('data-menu-classes')

    accessibleAutocomplete.enhanceSelectElement({
      defaultValue: invalidInput ?? '',
      selectElement: selectElement,
      inputClasses,
      menuClasses,
    })
  })

  document.querySelectorAll('.js-autocomplete-submit').forEach(submitButton => {
    submitButton.addEventListener('click', function () {
      document.querySelectorAll('.autocomplete__input').forEach(inputElement => {
        const autocompleteInput = inputElement.value.trim()
        const autocompleteSelect = document.getElementById(`${inputElement.id}-select`)
        const errorField = document.getElementById(`${inputElement.id}-error`)

        if (!autocompleteInput.length) {
          autocompleteSelect.value = ''
          return
        }

        const options = $(`#${inputElement.id}-select`).find('option')
        const textValues = $.map(options, function (option) {
          return option.text
        })

        if (!textValues.map(value => value.toLowerCase()).includes(autocompleteInput.toLowerCase())) {
          autocompleteSelect.value = ''
          errorField.value = autocompleteInput
        } else {
          errorField.value = ''
        }
      })
    })
  })
})
