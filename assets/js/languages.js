document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.js-autocomplete-select').forEach(selectElement => {
    const invalidInput = document.getElementById(`${selectElement.id}Error`).value
    accessibleAutocomplete.enhanceSelectElement({
      defaultValue: invalidInput ?? '',
      selectElement: selectElement,
      inputClasses: 'govuk-input--width-30',
      menuClasses: 'govuk-input--width-30',
    })
  })

  document.querySelectorAll('.js-autocomplete-submit').forEach(submitButton => {
    submitButton.addEventListener('click', function () {
      document.querySelectorAll('.autocomplete__input').forEach(inputElement => {
        const autocompleteInput = inputElement.value.trim()
        const autocompleteSelect = document.getElementById(`${inputElement.id}-select`)
        const errorField = document.getElementById(`${inputElement.id}Error`)

        const otherLanguages = Array.from(document.querySelectorAll('.other-languages-sidebar > div')).map(
          otherLanguage => otherLanguage.textContent.split('(')[0].trim(),
        )

        if (!autocompleteInput.length) {
          autocompleteSelect.value = ''
          return
        }

        const options = $('.js-autocomplete-select').first().find('option')
        const textValues = $.map(options, function (option) {
          return option.text
        })

        if (otherLanguages.map(lang => lang.toLowerCase()).includes(autocompleteInput.toLowerCase())) {
          const currentLanguageCode = window.location.pathname.split('/').filter(Boolean).pop()
          if (autocompleteSelect.value !== currentLanguageCode) autocompleteSelect.value = ''
          errorField.value = `DUPLICATE:${autocompleteInput}`
        } else if (!textValues.map(value => value.toLowerCase()).includes(autocompleteInput.toLowerCase())) {
          autocompleteSelect.value = ''
          errorField.value = `INVALID:${autocompleteInput}`
        }
      })
    })
  })
})
