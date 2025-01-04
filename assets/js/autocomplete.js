accessibleAutocomplete.enhanceSelectElement({
  defaultValue: '',
  selectElement: document.querySelector('#autocomplete'),
})

$(function() {
  $('.js-autocomplete-submit').on('click', function() {
    const autocompleteInput = $('.autocomplete__input').val()

    if (!$.trim(autocompleteInput).length) {
      $('.js-autocomplete-select').val('')
      return
    }

    const options = $('#autocomplete-select option')
    const textValues = $.map(options, function(option) {
      return option.text
    })

    if (!textValues.includes(autocompleteInput)) {
      $('.js-autocomplete-select').val('')
      $('input[name=radioField]:checked').val('OTHER__VALIDATION_ERROR')
    }
  })
})
