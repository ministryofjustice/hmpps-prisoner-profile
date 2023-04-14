/**
 * Get any elements with data-module 'ds-datepicker' and attach date picker
 */
import DSDatePicker from './js/hmppsDatepicker.js'

Array.from(document.querySelectorAll('[data-module="ds-datepicker"]')).forEach(element => {
  new DSDatePicker(element).init()
})
