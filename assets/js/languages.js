document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.js-autocomplete-select').forEach(selectElement => {
    accessibleAutocomplete.enhanceSelectElement({
      defaultValue: '',
      selectElement: selectElement,
      inputClasses: 'govuk-input--width-30',
      menuClasses: 'govuk-input--width-30',
    })
  })

  document.querySelectorAll('.js-autocomplete-submit').forEach(submitButton => {
    submitButton.addEventListener('click', function (event) {
      document.querySelectorAll('.autocomplete__input').forEach(inputElement => {
        const autocompleteInput = inputElement.value.trim()
        const autocompleteSelect = document.getElementById(`${inputElement.id}-select`)
        const errorField = document.getElementById(`${inputElement.id}Error`)

        if (!autocompleteInput.length) {
          autocompleteSelect.value = ''
          return
        }

        const options = $('.js-autocomplete-select').first().find('option')
        const textValues = $.map(options, function (option) {
          return option.text
        })

        if (!textValues.includes(autocompleteInput)) {
          autocompleteSelect.value = ''
          errorField.value = autocompleteInput
        }
      })
    })
  })
})
