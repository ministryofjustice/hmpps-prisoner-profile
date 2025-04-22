document.addEventListener('DOMContentLoaded', () => {
  // Enhance select elements with accessible autocomplete
  document.querySelectorAll('.js-autocomplete-select').forEach(selectElement => {
    const invalidInput = document.getElementById(`${selectElement.id}Error`)?.value || ''
    accessibleAutocomplete.enhanceSelectElement({
      defaultValue: invalidInput,
      selectElement,
      inputClasses: 'govuk-input--width-20',
      menuClasses: 'govuk-input--width-20',
    })
  })

  // Handle Submission
  document.querySelectorAll('.js-autocomplete-submit').forEach(submitButton => {
    submitButton.addEventListener('click', () => {
      document.querySelectorAll('.autocomplete__input').forEach(inputElement => {
        const autocompleteInput = inputElement.value.trim()
        const selectElement = document.getElementById(`${inputElement.id}-select`)
        const errorField = document.getElementById(`${inputElement.id}Error`)

        if (!autocompleteInput) {
          selectElement.value = ''
          return
        }

        const options = Array.from(selectElement.options).map(option => option.text.toLowerCase())
        if (!options.includes(autocompleteInput.toLowerCase())) {
          selectElement.value = ''
          if (errorField) errorField.value = autocompleteInput
        }
      })
    })
  })
})
