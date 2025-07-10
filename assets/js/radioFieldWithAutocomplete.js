accessibleAutocomplete.enhanceSelectElement({
  defaultValue: '',
  selectElement: document.querySelector('#autocomplete'),
  inputClasses: 'govuk-input--width-30',
  menuClasses: 'govuk-input--width-30',
})

$(function () {
  $('.js-autocomplete-submit').on('click', function () {
    const selectedOption = $('input[name=radioField]:checked')
    const autocompleteInput = $('.autocomplete__input').val()

    if (selectedOption.val() !== 'OTHER' || !$.trim(autocompleteInput).length) {
      $('.js-autocomplete-select').val('')
      return
    }

    const options = $('#autocomplete-select option')
    const textValues = $.map(options, function (option) {
      return option.text
    })

    if (!textValues.includes(autocompleteInput)) {
      $('.js-autocomplete-select').val('')
      selectedOption.val('OTHER__VALIDATION_ERROR')
    }
  })
})
